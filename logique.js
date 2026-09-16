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

  /**
   * Reference creanciere SCOR (norme ISO 11649), pour un IBAN
   * ordinaire — un QR-IBAN exige au contraire une reference QRR.
   *
   * Forme : « RF » + deux chiffres de controle + jusqu'a 21 caracteres.
   * Les chiffres de controle se calculent en deplacant « RF00 » a la
   * fin, en remplacant chaque lettre par sa position + 9 (A=10, Z=35),
   * puis 98 moins le reste de la division par 97.
   *
   * On y met le numero de facture : il revient avec le paiement, ce qui
   * permet de rapprocher un versement d'une facture sans chercher.
   */
  function referenceCreanciere(numero) {
    // Seuls chiffres et lettres sont admis : « F0007-2026 » devient
    // « F00072026 ».
    var base = String(numero).toUpperCase().replace(/[^0-9A-Z]/g, '')
      .slice(0, 21);
    if (!base) base = '1';

    var chiffres = (base + 'RF00').replace(/[A-Z]/g, function (c) {
      return String(c.charCodeAt(0) - 55);
    });

    // Le nombre depasse ce qu'un entier peut contenir : on divise par
    // tranches, comme une division posee a la main.
    var reste = 0;
    for (var i = 0; i < chiffres.length; i++) {
      reste = (reste * 10 + Number(chiffres[i])) % 97;
    }
    var controle = String(98 - reste).padStart(2, '0');
    return 'RF' + controle + base;
  }

  /**
   * Construit un vrai fichier PDF de la facture — pas une capture
   * d'ecran, un document texte genere directement, page par page,
   * avec la partie paiement QR-facture integree par la bibliotheque
   * suisse elle-meme.
   *
   * Necessite PDFKit et le module PDF de swissqrbill, charges a la
   * demande uniquement (ce sont de gros fichiers, inutiles tant que
   * personne n'appuie sur « Envoyer »).
   *
   * `logoBytes` est facultatif : sans logo charge, le document se
   * construit quand meme, sans lui — comme sur l'ecran, une image
   * absente ne doit jamais empecher le reste de fonctionner.
   */
  function construirePdfFacture(f, reglages, PDFDocumentCtor, SwissQRBillPDF, logoBytes) {
    return new Promise(function (resolve, reject) {
      try {
        var e = reglages.entreprise || {};
        var d = f.donnees || {};
        var c = d.client || {};
        var emise = new Date(f.emise_le || Date.now());
        var delai = (reglages.tva && reglages.tva.delaiJours) || 30;
        var echeance = new Date(emise.getTime() + delai * 86400000);
        var jour = function (x) { return x.toLocaleDateString('fr-CH'); };

        var doc = new PDFDocumentCtor({ size: 'A4', margin: 50 });
        var chunks = [];
        doc.on('data', function (ch) { chunks.push(ch); });
        doc.on('end', function () {
          resolve(new Blob(chunks, { type: 'application/pdf' }));
        });

        var largeurPage = doc.page.width - doc.page.margins.left
          - doc.page.margins.right;
        var y = doc.page.margins.top;

        // Logo centre en haut, dans le meme ordre que la version ecran.
        if (logoBytes) {
          var cote = 60;
          doc.image(logoBytes, doc.page.margins.left + (largeurPage - cote) / 2,
            y, { width: cote, height: cote });
          y += cote + 12;
        }

        // Deux colonnes : client a gauche, entreprise a droite — meme
        // disposition que le document affiche a l'ecran.
        var largeurColonne = largeurPage / 2 - 10;
        var xDroite = doc.page.margins.left + largeurPage / 2 + 10;
        doc.fontSize(10).fillColor('#000');

        doc.text([c.clientNom, c.adresse,
          [c.npa, c.localite].filter(Boolean).join(' '), c.email]
          .filter(Boolean).join('\n'),
          doc.page.margins.left, y, { width: largeurColonne });

        doc.text([e.nom, [e.adresse, e.numero].filter(Boolean).join(' '),
          [e.npa, e.localite].filter(Boolean).join(' '), e.telephone, e.email]
          .filter(Boolean).join('\n'),
          xDroite, y, { width: largeurColonne, align: 'right' });

        doc.y = y + 70;
        doc.x = doc.page.margins.left;

        // Numero, dates : mis en avant, comme sur l'ecran.
        doc.fontSize(14).text(f.numero, { continued: false });
        doc.fontSize(10).fillColor('#444')
          .text('Date : ' + jour(emise))
          .text('Payable jusqu\u2019au ' + jour(echeance));

        var mentions = [];
        if (reglages.tva && reglages.tva.assujetti && reglages.tva.numero) {
          mentions.push('N° TVA : ' + reglages.tva.numero);
        }
        if (reglages.tva && reglages.tva.assujetti) {
          mentions.push('Montants en CHF, TVA ' + reglages.tva.taux
            + ' % comprise.');
        } else {
          mentions.push('Non assujetti à la TVA selon l\u2019art. 10 al. 2 LTVA');
        }
        if (c.signature) {
          mentions.push('Intervention confirmée par la signature du client.');
        }
        if (d.annulee) {
          mentions.push('FACTURE ANNULÉE — ' + (d.motifAnnulation || ''));
        }
        doc.moveDown(0.5).text(mentions.join('\n'));

        // Lignes de la facture.
        doc.moveDown(1).fillColor('#000').fontSize(11);
        (d.lignes || []).forEach(function (l) {
          var ligneY = doc.y;
          doc.text(l.label, doc.page.margins.left, ligneY,
            { width: largeurColonne * 1.4 });
          doc.text(B.formatChf(l.amount) + ' CHF',
            doc.page.margins.left, ligneY,
            { width: largeurPage, align: 'right' });
          doc.moveDown(0.3);
        });

        doc.moveDown(0.5);
        var yTotal = doc.y;
        doc.fontSize(13).text('Total', doc.page.margins.left, yTotal);
        doc.text(B.formatChf(f.total_rappen) + ' CHF',
          doc.page.margins.left, yTotal, { width: largeurPage, align: 'right' });

        if (d.totaux && d.totaux.vat) {
          doc.moveDown(0.3).fontSize(10).fillColor('#444');
          var yVat = doc.y;
          doc.text('dont TVA', doc.page.margins.left, yVat);
          doc.text(B.formatChf(d.totaux.vat) + ' CHF',
            doc.page.margins.left, yVat, { width: largeurPage, align: 'right' });
        }

        // Signature du client, si recueillie — meme image que sur l'ecran.
        if (c.signature) {
          try {
            var base64 = c.signature.split(',')[1];
            doc.moveDown(1.2).fillColor('#000').fontSize(10)
              .text('Signé par le client le '
                + jour(new Date(c.signeeLe || f.emise_le)));
            doc.image(Buffer.from ? Buffer.from(base64, 'base64')
              : base64ArrayBuffer(base64), doc.page.margins.left, doc.y + 4,
              { width: 160 });
            doc.moveDown(4);
          } catch (errSig) { /* une signature illisible ne bloque pas le PDF */ }
        }

        // La partie paiement : la bibliotheque suisse gere elle-meme la
        // pagination si la place manque sur cette page.
        var qr = new SwissQRBillPDF.SwissQRBill({
          currency: 'CHF', amount: B.toFrancs(f.total_rappen),
          reference: f.reference_qr,
          creditor: {
            name: e.nom, address: e.adresse, buildingNumber: e.numero || '',
            zip: Number(e.npa), city: e.localite, country: 'CH',
            account: String(e.iban || '').replace(/\s/g, ''),
          },
          debtor: c.clientNom ? {
            name: c.clientNom, address: c.adresse || '',
            buildingNumber: c.numero || '', zip: Number(c.npa) || 0,
            city: c.localite || '', country: 'CH',
          } : undefined,
        }, { language: 'FR' });
        qr.attachTo(doc);

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Base64 -> ArrayBuffer, pour les navigateurs sans Buffer global. */
  function base64ArrayBuffer(base64) {
    var bin = global.atob(base64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
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

    /*
      DEUX TYPES D'IBAN, DEUX TYPES DE REFERENCE — et on ne melange pas.

      Verifie avec la bibliotheque suisse elle-meme :

        QR-IBAN      + reference QRR  -> accepte
        QR-IBAN      + aucune         -> REFUSE
        IBAN normal  + reference QRR  -> REFUSE
        IBAN normal  + reference SCOR -> accepte
        IBAN normal  + aucune         -> accepte

      Le code fabriquait TOUJOURS une reference QRR. Avec un IBAN
      ordinaire — le cas de Philippe — la QR-facture ne se generait
      pas du tout : « QR-Reference requires the use of a QR-IBAN ».

      Un IBAN se reconnait a son numero d'institution (positions 5 a 9) :
      de 30000 a 31999, c'est un QR-IBAN. `isQrIban` s'en charge.

      Pour un IBAN ordinaire on emet une reference SCOR plutot que rien :
      elle apparait sur le bulletin et revient avec le paiement, ce qui
      permet de rapprocher un versement d'une facture. Sans reference,
      il faudrait identifier chaque paiement a la main.
    */
    var m = String(numero).match(/^([A-Z]*)(\d+)-(\d{4})$/);
    if (!m) {
      return { erreur: 'Numéro de facture inattendu : ' + numero };
    }

    var iban = String((reglages.entreprise || {}).iban || '');
    var estQrIban = B.isQrIban(iban);
    var reference = estQrIban
      // Reference QR : annee + sequence, lisible et triable dans
      // l'e-banking du client.
      ? B.invoiceQrReference({ year: Number(m[3]), seq: Number(m[2]) })
      : referenceCreanciere(numero);

    return {
      numero: numero,
      reference: reference,
      typeReference: estQrIban ? 'QRR' : 'SCOR',
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
      var svg = new SwissQRBill(donnees, { language: 'FR' }).toString();
      /*
        DEFAUT VECU, serieux : sur telephone, la partie paiement ne
        s'affichait qu'a moitie — « Section paiement » coupee au bord
        de l'ecran, comme un extrait zoome plutot que le document
        entier.

        CAUSE, verifiee sur le vrai SVG produit par la bibliotheque :
        son element racine porte `width="210mm" height="105mm"` mais
        AUCUN `viewBox`. Sans viewBox, la regle CSS
        `width:100%;height:auto` reduit bien la BOITE exterieure du
        SVG a la largeur de l'ecran, mais le CONTENU dessine a
        l'interieur reste positionne a sa taille physique d'origine
        (210 mm, soit environ 794 px) : le navigateur ne SAIT PAS
        comment redimensionner ce contenu puisque rien ne decrit son
        systeme de coordonnees interne. Le resultat n'est pas un SVG
        reduit, mais une FENETRE reduite ouverte sur un document
        grandeur nature — d'ou la moitie manquante.

        Le viewBox ajoute ici decrit exactement les memes dimensions,
        converties en pixels a 96 dpi (le standard CSS pour le
        millimetre) : 210 mm x 105 mm = 793.7 x 396.85. Il ne change
        rien a l'affichage grandeur nature ni a l'impression — il
        permet seulement au navigateur de reduire le contenu de facon
        PROPORTIONNELLE quand on lui demande de tenir dans un ecran de
        telephone.
      */
      if (!/viewBox=/.test(svg)) {
        svg = svg.replace('<svg ', '<svg viewBox="0 0 793.7 396.85" ');
      }
      return { svg: svg };
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
  /*
    Recherche de localites suisses, pour proposer NPA et ville pendant
    la saisie.

    CE QUE LE SERVICE RENVOIE REELLEMENT — verifie sur reponses reelles
    du 05.09.2026, pas suppose :

      searchText=1422&origins=zipcode
        -> label « <b>1422 - Grandson</b> », origin « zipcode ».
           Noter le TIRET : le format n'est pas « 1422 Grandson ».

      searchText=Grand&origins=address
        -> label « Grand-Rue # <b>1607 Palézieux-Village</b> ».
           La recherche a porte sur le nom de RUE, pas sur la ville.

      searchText=Grandson&origins=zipcode
        -> liste VIDE. L'index des NPA se cherche par NUMERO seulement.

    D'ou deux strategies distinctes :
      — que des chiffres : recherche « zipcode », directe et fiable ;
      — des lettres : recherche « address », puis on ne GARDE que les
        resultats dont la LOCALITE commence par le texte tape. C'est ce
        filtre qui ecarte « Grand-Rue à Palézieux » tout en conservant
        une adresse située à Grandson.
  */
  function motCle(t) {
    return String(t || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  /** Extrait « NPA » et « localite » du libelle d'un resultat. */
  function lireNpaLocalite(attrs) {
    var gras = String((attrs && attrs.label) || '')
      .match(/<b>([^]*?)<\/b>/);
    if (!gras) return null;
    var texte = gras[1].replace(/<[^>]*>/g, '').trim();
    // « 1422 - Grandson » (zipcode) et « 1607 Palézieux-Village »
    // (address) : le tiret est optionnel.
    var m = texte.match(/^(\d{4})\s*-?\s*(.+)$/);
    if (!m) return null;
    return { npa: m[1], localite: m[2].trim() };
  }

  function chercherLocalites(texte, fetchFn, cache) {
    var q = String(texte || '').trim();
    if (q.length < 2) return Promise.resolve([]);
    var cle = 'loc:' + motCle(q);
    if (cache && cache[cle] !== undefined) return Promise.resolve(cache[cle]);

    var chiffresSeuls = /^\d+$/.test(q);
    var url = 'https://api3.geo.admin.ch/rest/services/api/SearchServer?'
      + 'searchText=' + encodeURIComponent(q)
      + '&type=locations&sr=4326&origins='
      + (chiffresSeuls ? 'zipcode' : 'address');

    return fetchFn(url)
      .then(function (r) {
        if (!r || !r.ok) throw new Error('recherche indisponible');
        return r.json();
      })
      .then(function (data) {
        var vus = {};
        var trouves = [];
        ((data && data.results) || []).forEach(function (x) {
          var l = lireNpaLocalite(x && x.attrs);
          if (!l) return;
          // Recherche par lettres : le service a pu repondre sur un nom
          // de RUE. On ne garde que si la LOCALITE correspond vraiment.
          if (!chiffresSeuls
              && motCle(l.localite).indexOf(motCle(q)) !== 0) return;
          var k = l.npa + '|' + motCle(l.localite);
          if (vus[k]) return;
          vus[k] = true;
          trouves.push(l);
        });
        if (cache) cache[cle] = trouves;
        return trouves;
      })
      .catch(function () {
        // Hors ligne ou service indisponible : la saisie manuelle
        // reste la reference, on ne bloque rien.
        return [];
      });
  }

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
    construirePdfFacture: construirePdfFacture,
    referenceCreanciere: referenceCreanciere,
    chercherLocalites: chercherLocalites,
    lireNpaLocalite: lireNpaLocalite,
    preparerDevis: preparerDevis,
    reglagesParDefaut: reglagesParDefaut,
    chiffrer: chiffrer,
    preparerFacture: preparerFacture,
    champsManquantsPourFacturer: champsManquantsPourFacturer,
    partiePaiementQR: partiePaiementQR,
    libellesInsectes: libellesInsectes,
  };
})(typeof window !== 'undefined' ? window : globalThis);
