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
      /*
        Toutes les regles sont des PRIX DE BASE : chacune donne un prix
        complet pour une situation donnee. Il n'y a plus de
        supplements qui s'ajoutent, donc plus de question de cumul.
        Le reglage « majorations » n'a plus d'objet et a ete retire.
      */

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
        { id: 'frelons', libelle: 'Frelons européens' },
        { id: 'frelon_asiatique', libelle: 'Frelon asiatique' },
        { id: 'bourdons', libelle: 'Bourdons' },
        { id: 'chenilles', libelle: 'Chenilles processionnaires' },
      ],
      /* Types de client, modifiables comme les autres listes. */
      typesClient: [
        { id: 'particulier', libelle: 'Particulier' },
        { id: 'commune', libelle: 'Commune' },
        { id: 'gerance', libelle: 'Gérance' },
        { id: 'entreprise', libelle: 'Entreprise' },
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
     Choix de la regle applicable
     ------------------------------------------------------------ */

  /*
    LA REGLE LA PLUS PRECISE GAGNE.

    Le moteur retient la premiere regle qui correspond, dans l'ordre du
    champ `sort`. Laisser cet ordre a la charge de l'utilisateur est un
    piege : « Guepes » placee avant « Guepes a plus de 15 m » repond la
    premiere, et le prix est faux sans que rien ne le signale. C'est
    exactement ce qui est arrive — un nid en hauteur facture au tarif
    d'un nid de fondation.

    On classe donc les regles par NOMBRE DE CONDITIONS, de la plus
    precise a la plus generale. « Guepes + plus de 15 m » (deux
    conditions) est examinee avant « Guepes » (une), elle-meme avant
    une regle sans condition.

    A precision egale, l'ordre choisi dans l'ecran departage.
  */
  function ordonnerParPrecision(regles) {
    return (regles || [])
      .filter(function (r) { return r.isActive !== false; })
      .map(function (r, i) {
        // Une condition sans valeur cochee ne restreint rien : elle ne
        // doit pas faire passer la regle pour plus precise qu'elle
        // n'est.
        var precision = (r.conditions || []).filter(function (c) {
          return (c.valeurs || []).length > 0;
        }).length;
        return { r: r, precision: precision, rang: i };
      })
      .sort(function (a, b) {
        if (b.precision !== a.precision) return b.precision - a.precision;
        return a.rang - b.rang;
      })
      .map(function (x, i) {
        // `sort` est ce que le moteur regarde : on le recalcule ici
        // plutot que de demander a l'utilisateur de le tenir a jour.
        return Object.assign({}, x.r, { sort: i, role: 'base' });
      });
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
      var reglesActives = ordonnerParPrecision(reglages.regles || []);

      if ((reglages.aides || []).length) {
        var sansAide = B.priceInterventionFromRules({
          customerType: intervention.typeClient || 'particulier',
          nests: intervention.nids || [],
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

  /* ------------------------------------------------------------
     Distance
     ------------------------------------------------------------ */

  /*
    Meme formule que BillyPro : vol d'oiseau (haversine) puis facteur
    de sinuosite de 1,3. Sur le reseau routier suisse, la route fait
    environ 30 % de plus que la ligne droite.

    C'est une ESTIMATION. Elle sert a pre-remplir un champ, jamais a
    imposer un montant : le kilometrage reste modifiable a la main.
  */
  var RAYON_TERRE_KM = 6371;
  var FACTEUR_ROUTE = 1.3;

  function volDoiseauKm(a, b) {
    var rad = function (d) { return (d * Math.PI) / 180; };
    var dLat = rad(b.lat - a.lat);
    var dLng = rad(b.lng - a.lng);
    var h = Math.pow(Math.sin(dLat / 2), 2)
      + Math.pow(Math.sin(dLng / 2), 2)
        * Math.cos(rad(a.lat)) * Math.cos(rad(b.lat));
    return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h));
  }

  /** `null` si l'un des deux points est inconnu : on ne devine pas. */
  function distanceRouteKm(a, b) {
    if (!a || !b || typeof a.lat !== 'number' || typeof b.lat !== 'number') {
      return null;
    }
    return Math.round(volDoiseauKm(a, b) * FACTEUR_ROUTE * 10) / 10;
  }

  /**
   * Interroge le geocodeur suisse officiel (gratuit, sans cle).
   *
   * `fetchFn` est injecte pour que la fonction soit testable sans
   * reseau. `cache` evite de redemander la meme adresse — et permet de
   * retrouver une position deja connue meme hors ligne.
   */
  function geocoder(texte, fetchFn, cache) {
    var cle = String(texte || '').trim().toLowerCase();
    if (!cle) return Promise.resolve(null);
    if (cache && cache[cle] !== undefined) return Promise.resolve(cache[cle]);

    var url = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?'
      + 'searchText=' + encodeURIComponent(texte)
      + '&type=locations&sr=4326';

    return fetchFn(url)
      .then(function (r) {
        if (!r || !r.ok) throw new Error('geocodage indisponible');
        return r.json();
      })
      .then(function (data) {
        var lieu = B.choisirLieuSuisse(
          ((data && data.results) || []).map(function (x) { return x.attrs; })
            .filter(Boolean));
        if (cache) cache[cle] = lieu;
        return lieu;
      })
      .catch(function () {
        // Reseau coupe, service indisponible, refus du navigateur :
        // on renvoie null. La saisie manuelle reste la reference.
        return null;
      });
  }

  global.BillySuisse = {
    ordonnerParPrecision: ordonnerParPrecision,
    volDoiseauKm: volDoiseauKm,
    distanceRouteKm: distanceRouteKm,
    geocoder: geocoder,
    preparerDevis: preparerDevis,
    reglagesParDefaut: reglagesParDefaut,
    chiffrer: chiffrer,
    preparerFacture: preparerFacture,
    champsManquantsPourFacturer: champsManquantsPourFacturer,
    partiePaiementQR: partiePaiementQR,
    libellesInsectes: libellesInsectes,
  };
})(typeof window !== 'undefined' ? window : globalThis);
