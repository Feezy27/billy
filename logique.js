/* ============================================================
   BillyPro Suisse — la logique, separee de l'affichage
   ============================================================

   POURQUOI UN FICHIER A PART
   Le site francais melange calcul et affichage dans 6 000 lignes :
   rien n'y est verifiable autrement qu'en cliquant. Ici, tout ce qui
   CALCULE vit dans ce fichier, sans toucher a la page. Il peut donc
   etre execute et verifie automatiquement (voir test-logique.mjs).

   Ce fichier n'invente aucun calcul : il appelle le moteur de
   BillyPro (moteur-billy.js), deja eprouve par 289 tests.
   ============================================================ */

(function (global) {
  'use strict';

  var B = global.Billy;

  /* ------------------------------------------------------------
     Reglages par defaut d'une entreprise suisse
     ------------------------------------------------------------ */
  function reglagesParDefaut() {
    return {
      entreprise: {
        nom: '', adresse: '', numero: '', npa: '', localite: '',
        telephone: '', email: '', iban: '',
      },
      // TVA suisse : le taux normal est 8.1 % depuis 2024.
      tva: {
        taux: 8.1,
        /* Numero TVA / IDE : obligatoire sur la facture d'un assujetti. */
        numero: '',
        /* Delai de paiement usuel en Suisse. */
        delaiJours: 30,
        /* Duree pendant laquelle un devis engage l'entreprise. */
        validiteDevisJours: 30,
        // Regle metier confirmee : les tarifs affiches sont TTC.
        // La TVA se lit « dont TVA », jamais ajoutee en pied de facture.
        mode: 'inclus',
        assujetti: true,
      },
      // Regle metier confirmee : entre deux majorations qui
      // s'appliquent au meme nid, seule la plus elevee compte.
      majorations: 'plus_elevee',

      /*
        GRILLE TARIFAIRE MODULABLE — le modele de BillyPro.

        Une entreprise n'est PAS obligee de facturer « a l'insecte ».
        Elle empile des regles ; chacune dit QUAND elle s'applique
        (ses conditions) et COMBIEN elle vaut (son calcul).

          au forfait   -> une regle sans condition
          a l'insecte  -> une regle par insecte
          a la hauteur -> une regle par palier
          combine      -> « frelon ET plus de 8 m » = une regle,
                          deux conditions

        Les conditions se cumulent (ET). Dans une condition, plusieurs
        valeurs sont acceptees (OU).

        Vide au depart : c'est a l'entreprise de decrire SA facon de
        facturer, pas au logiciel de la lui imposer.
      */
      regles: [],

      /* Remise a partir du 2e nid. null = aucune. */
      degressivite: null,

      /*
        AIDES COMMUNALES ET CANTONALES.

        Regle metier confirmee : une aide se configure en PARAMETRES,
        jamais pendant la saisie d'un rendez-vous. Un client qui
        declare « ma commune paie » ne peut pas etre verifie sur le
        moment ; c'est l'entreprise qui sait avec qui elle a une
        convention.

        L'aide s'applique donc automatiquement quand le NPA du lieu
        d'intervention correspond a une commune conventionnee.

        Deux modes : « deduite » (retiree du total, le client paie
        moins) ou « remboursee » (le client paie tout et se fait
        rembourser — la ligne est affichee pour information).
      */
      aides: [],

      /* Listes parametrables, utilisees par les conditions. */
      localisations: [
        { id: 'exterieur', libelle: 'Extérieur accessible' },
        { id: 'toiture', libelle: 'Toiture' },
        { id: 'cheminee', libelle: 'Cheminée' },
        { id: 'comble', libelle: 'Combles' },
        { id: 'cave', libelle: 'Cave / vide sanitaire' },
      ],
      hauteurs: [
        { id: 'h0_3', libelle: "Jusqu'à 3 m" },
        { id: 'h3_8', libelle: '3 à 8 m' },
        { id: 'h8_15', libelle: '8 à 15 m' },
        { id: 'h15p', libelle: 'Plus de 15 m' },
      ],

      deplacement: {
        mode: 'par_km', montant: 0, chfKm: 1.2,
        allerRetour: true, franchiseKm: 10, zones: [], cantons: [],
      },
      insectes: [
        { id: 'guepes', libelle: 'Guêpes' },
        { id: 'frelons', libelle: 'Frelons' },
        { id: 'frelon_asiatique', libelle: 'Frelon asiatique' },
        { id: 'chenilles', libelle: 'Chenilles processionnaires' },
      ],
    };
  }

  /** Libelles des insectes, dans la forme attendue par le moteur. */
  function libellesInsectes(reglages) {
    var m = {};
    (reglages.insectes || []).forEach(function (i) { m[i.id] = i.libelle; });
    return m;
  }

  /* ------------------------------------------------------------
     Chiffrage d'une intervention
     ------------------------------------------------------------ */

  /**
   * Renvoie { lignes, totaux } ou { erreur } — jamais une exception
   * qui remonterait jusqu'a une page blanche.
   *
   * `distanceKm` null = pas de frais de deplacement calcules.
   */
  function chiffrer(intervention, reglages) {
    try {
      var dep = null;
      if (intervention.distanceKm != null && reglages.deplacement) {
        dep = B.computeTravelFee(
          reglages.deplacement, intervention.distanceKm,
          intervention.npa || null, intervention.canton || null,
        );
      }

      /*
        Moteur a REGLES, pas le moteur « un prix par insecte ».
        C'est celui qui sait traiter les conditions combinees, la
        degressivite multi-nids, les couts ponctuels et le forfait
        negocie — tout ce qui a ete mis au point dans BillyPro.
      */
      /*
        Aides applicables, calculees a partir du LIEU et des insectes
        traites — pas d'une saisie a la volee.

        Le sous-total sert de base aux aides en pourcentage. On chiffre
        donc une premiere fois sans aide pour l'obtenir.
      */
      var aideParNid = 0;
      var aidesAppliquees = { deducted: [], informational: [] };
      var reglesActives = (reglages.regles || []).filter(function (r) {
        return r.isActive !== false;
      });

      if ((reglages.aides || []).length) {
        var sansAide = B.priceInterventionFromRules({
          customerType: intervention.typeClient || 'particulier',
          nests: intervention.nids || [],
          modifierCombination: reglages.majorations || 'plus_elevee',
          degressivite: reglages.degressivite || undefined,
        }, reglesActives);
        var sousTotal = sansAide.reduce(function (t, l) {
          return t + (l.amount > 0 ? l.amount : 0);
        }, 0);

        aidesAppliquees = B.computeSubsidies(reglages.aides, {
          npa: intervention.npa || null,
          canton: intervention.canton || null,
          nests: intervention.nids || [],
          subtotal: sousTotal,
        });

        // Le moteur de tarification prend une aide PAR NID : on lui
        // transmet la part deduite, ramenee au nid.
        var totalDeduit = aidesAppliquees.deducted.reduce(
          function (t, a) { return t + a.amount; }, 0);
        var nbNids = (intervention.nids || []).reduce(
          function (t, n) { return t + (n.quantity || 1); }, 0) || 1;
        aideParNid = Math.round(totalDeduit / nbNids);
      }

      var lignes = B.priceInterventionFromRules(
        {
          customerType: intervention.typeClient || 'particulier',
          nests: intervention.nids || [],
          modifierCombination: reglages.majorations || 'plus_elevee',
          dureeMin: intervention.dureeMin,
          distanceKm: intervention.distanceKm == null
            ? undefined : intervention.distanceKm,
          municipalitySubsidyPerNest: aideParNid,
          travelFee: dep ? dep.amount : 0,
          travelFeeLabel: dep ? dep.label : undefined,
          degressivite: reglages.degressivite || undefined,
          supplementsPonctuels: intervention.supplementsPonctuels || undefined,
          prixConvenu: intervention.prixConvenu || undefined,
        },
        reglesActives,
      );

      var totaux = B.computeTotals(
        lignes,
        reglages.tva && reglages.tva.assujetti ? reglages.tva.taux : 0,
        {
          mode: (reglages.tva && reglages.tva.mode) || 'inclus',
          exempt: !(reglages.tva && reglages.tva.assujetti),
        },
      );

      return {
        lignes: lignes, totaux: totaux, deplacement: dep,
        aides: aidesAppliquees.deducted,
        // « Remboursee » : le client paie tout et se fait rembourser
        // par sa commune. Affiche pour information, jamais deduit.
        aidesInformatives: aidesAppliquees.informational,
      };
    } catch (e) {
      // MissingTariffError porte un message utile : « Aucun tarif de
      // base pour l'insecte X » plutot que « undefined ».
      return { erreur: e && e.message ? e.message : String(e) };
    }
  }

  /* ------------------------------------------------------------
     Facture
     ------------------------------------------------------------ */

  /**
   * Prepare une facture a partir d'une intervention chiffree.
   * Le NUMERO n'est pas invente ici : il vient du depot, qui seul
   * sait garantir l'absence de doublon.
   */
  function preparerFacture(intervention, reglages, numero) {
    var chiffrage = chiffrer(intervention, reglages);
    if (chiffrage.erreur) return { erreur: chiffrage.erreur };

    var manquants = champsManquantsPourFacturer(reglages);
    if (manquants.length) {
      return { erreur: 'Reglages incomplets : ' + manquants.join(', ') };
    }

    // Reference QR : construite par la fonction prevue pour cela dans
    // BillyPro — annee + sequence, lisible et triable dans l'e-banking
    // du client. Le numero « F0007-2026 » donne annee 2026, sequence 7.
    var m = String(numero).match(/^([A-Z]*)(\d+)-(\d{4})$/);
    if (!m) {
      return { erreur: 'Numéro de facture inattendu : ' + numero };
    }
    var reference = B.invoiceQrReference({
      year: Number(m[3]), seq: Number(m[2]),
    });

    return {
      numero: numero,
      reference: reference,
      lignes: chiffrage.lignes,
      totaux: chiffrage.totaux,
      totalRappen: chiffrage.totaux.total,
      totalAffiche: B.formatChf(chiffrage.totaux.total),
      dontTva: B.formatChf(chiffrage.totaux.vat),
      emiseLe: new Date().toISOString(),
    };
  }

  /** Ce qu'il manque pour qu'une facture suisse soit valable. */
  function champsManquantsPourFacturer(reglages) {
    var e = (reglages && reglages.entreprise) || {};
    var manque = [];
    if (!e.nom) manque.push('nom de l\u2019entreprise');
    if (!e.iban) manque.push('IBAN');
    else if (!B.isValidIban(e.iban)) manque.push('IBAN invalide');
    if (!e.npa) manque.push('NPA');
    if (!e.localite) manque.push('localité');
    if (!e.adresse) manque.push('adresse');
    // Un assujetti DOIT faire figurer son numero TVA sur ses factures.
    // L'oublier rend la facture contestable par le client.
    if (reglages && reglages.tva && reglages.tva.assujetti
        && !String(reglages.tva.numero || '').trim()) {
      manque.push('numéro TVA');
    }
    return manque;
  }

  /**
   * Partie paiement QR, en image vectorielle.
   * Fabriquee dans le navigateur : aucun serveur n'est necessaire.
   * `SwissQRBill` est fourni par la page (bibliotheque swissqrbill).
   */
  function partiePaiementQR(facture, reglages, client, SwissQRBill) {
    if (!SwissQRBill) return { erreur: 'Bibliothèque QR absente' };
    var e = reglages.entreprise;
    try {
      var donnees = {
        currency: 'CHF',
        amount: B.toFrancs(facture.totalRappen),
        reference: facture.reference,
        creditor: {
          name: e.nom, address: e.adresse,
          buildingNumber: e.numero || '', zip: Number(e.npa),
          city: e.localite, country: 'CH', account: e.iban.replace(/\s/g, ''),
        },
      };
      if (client && client.nom) {
        donnees.debtor = {
          name: client.nom, address: client.adresse || '',
          buildingNumber: client.numero || '',
          zip: Number(client.npa) || 0, city: client.localite || '',
          country: 'CH',
        };
      }
      return { svg: new SwissQRBill(donnees, { language: 'FR' }).toString() };
    } catch (err) {
      return { erreur: err && err.message ? err.message : String(err) };
    }
  }

  /**
   * Prepare un DEVIS.
   *
   * Un devis n'est pas une facture : rien n'est du, rien n'est
   * comptabilise, et il n'y a pas de partie paiement QR — proposer un
   * QR sur un devis inviterait le client a payer un travail pas
   * encore fait.
   *
   * En revanche il engage l'entreprise sur un prix pendant une duree :
   * la date de validite doit figurer, sinon le client peut l'invoquer
   * six mois plus tard.
   */
  function preparerDevis(intervention, reglages, numero) {
    var chiffrage = chiffrer(intervention, reglages);
    if (chiffrage.erreur) return { erreur: chiffrage.erreur };

    // Un devis n'a pas besoin d'IBAN : on ne demande que l'identite.
    var e = (reglages && reglages.entreprise) || {};
    if (!e.nom) return { erreur: 'Réglages incomplets : nom de l\u2019entreprise' };

    var jours = (reglages.tva && reglages.tva.validiteDevisJours) || 30;
    var etabli = new Date();
    return {
      numero: numero,
      lignes: chiffrage.lignes,
      totaux: chiffrage.totaux,
      totalRappen: chiffrage.totaux.total,
      totalAffiche: B.formatChf(chiffrage.totaux.total),
      etabliLe: etabli.toISOString(),
      valableJusquau: new Date(
        etabli.getTime() + jours * 86400000).toISOString(),
    };
  }

  global.BillySuisse = {
    preparerDevis: preparerDevis,
    reglagesParDefaut: reglagesParDefaut,
    chiffrer: chiffrer,
    preparerFacture: preparerFacture,
    champsManquantsPourFacturer: champsManquantsPourFacturer,
    partiePaiementQR: partiePaiementQR,
    libellesInsectes: libellesInsectes,
  };
})(typeof window !== 'undefined' ? window : globalThis);
