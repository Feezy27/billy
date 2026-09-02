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
      var lignes = B.priceInterventionFromRules(
        {
          customerType: intervention.typeClient || 'particulier',
          nests: intervention.nids || [],
          modifierCombination: reglages.majorations || 'plus_elevee',
          dureeMin: intervention.dureeMin,
          distanceKm: intervention.distanceKm == null
            ? undefined : intervention.distanceKm,
          municipalitySubsidyPerNest: intervention.aideParNid || 0,
          travelFee: dep ? dep.amount : 0,
          travelFeeLabel: dep ? dep.label : undefined,
          degressivite: reglages.degressivite || undefined,
          supplementsPonctuels: intervention.supplementsPonctuels || undefined,
          prixConvenu: intervention.prixConvenu || undefined,
        },
        (reglages.regles || []).filter(function (r) {
          return r.isActive !== false;
        }),
      );

      var totaux = B.computeTotals(
        lignes,
        reglages.tva && reglages.tva.assujetti ? reglages.tva.taux : 0,
        {
          mode: (reglages.tva && reglages.tva.mode) || 'inclus',
          exempt: !(reglages.tva && reglages.tva.assujetti),
        },
      );

      return { lignes: lignes, totaux: totaux, deplacement: dep };
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

  global.BillySuisse = {
    reglagesParDefaut: reglagesParDefaut,
    chiffrer: chiffrer,
    preparerFacture: preparerFacture,
    champsManquantsPourFacturer: champsManquantsPourFacturer,
    partiePaiementQR: partiePaiementQR,
    libellesInsectes: libellesInsectes,
  };
})(typeof window !== 'undefined' ? window : globalThis);
