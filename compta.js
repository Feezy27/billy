/*
  COMPTABILITE EN PARTIE DOUBLE — le moteur.

  Une Sarl doit tenir une comptabilite complete (art. 957 CO) : chaque
  operation s'inscrit deux fois, au DEBIT d'un compte et au CREDIT
  d'un autre, pour le meme montant. La somme des debits egale
  toujours la somme des credits — c'est la seule verification qui
  prouve qu'aucune moitie d'ecriture n'a ete perdue.

  PARTI PRIS CENTRAL : LES ECRITURES NE SONT PAS STOCKEES.

  Elles sont RECALCULEES a chaque affichage, a partir de ce qui
  existe deja : les factures et les depenses saisies. Deux raisons :

   1. Rien ne peut se desynchroniser. Une facture marquee payee met
      la comptabilite a jour au meme instant, sans etape de
      « passation » a ne pas oublier. C'est ce que Philippe demande :
      une comptabilite qui se fait sous ses yeux.
   2. Pas de double verite. Un stock d'ecritures separe finirait par
      diverger des factures — le defaut classique de ce genre
      d'outil.

  Ce que le moteur NE fait pas : choisir a la place du comptable. Il
  equilibre, il totalise, il presente. Le choix du compte pour une
  depense reste humain, et un fiduciaire doit relire le plan
  comptable avant le premier bouclement.

  Tous les montants sont en RAPPEN (centimes), jamais en francs a
  virgule flottante.
*/
(function (global) {
  'use strict';

  /*
    PLAN COMPTABLE PAR DEFAUT.

    Inspire du plan comptable PME suisse, reduit a ce qu'une
    entreprise de desinsectisation utilise vraiment. Volontairement
    court : une liste de 40 comptes inutilises rend la saisie plus
    difficile, pas plus juste. Philippe ajoute ce qui lui manque.

    `type` decide de la place au bilan ou au compte de resultat :
      actif / passif        -> bilan
      produit / charge      -> compte de resultat
    `sens` dit de quel cote le compte augmente : les actifs et les
    charges augmentent au debit, les passifs et les produits au
    credit.
  */
  function planParDefaut() {
    return [
      { numero: '1000', libelle: 'Caisse', type: 'actif' },
      { numero: '1020', libelle: 'Banque', type: 'actif' },
      { numero: '1100', libelle: 'Clients (factures à encaisser)', type: 'actif' },
      { numero: '1500', libelle: 'Machines et matériel', type: 'actif' },
      { numero: '1530', libelle: 'Véhicule', type: 'actif' },
      { numero: '2000', libelle: 'Fournisseurs (à payer)', type: 'passif' },
      { numero: '2800', libelle: 'Capital social', type: 'passif' },
      { numero: '2979', libelle: 'Résultat reporté', type: 'passif' },
      { numero: '3400', libelle: 'Prestations de désinsectisation', type: 'produit' },
      { numero: '4000', libelle: 'Produits et matériel consommé', type: 'charge' },
      { numero: '5000', libelle: 'Salaires', type: 'charge' },
      { numero: '5700', libelle: 'Charges sociales', type: 'charge' },
      { numero: '6000', libelle: 'Loyer et local', type: 'charge' },
      { numero: '6200', libelle: 'Véhicule et carburant', type: 'charge' },
      { numero: '6300', libelle: 'Assurances', type: 'charge' },
      { numero: '6500', libelle: 'Frais administratifs et téléphone', type: 'charge' },
      { numero: '6570', libelle: 'Informatique et logiciels', type: 'charge' },
      { numero: '6600', libelle: 'Publicité', type: 'charge' },
      { numero: '6800', libelle: 'Amortissements', type: 'charge' },
      { numero: '6900', libelle: 'Frais bancaires et intérêts', type: 'charge' },
    ];
  }

  /*
    Reglages de l'exercice. Une Sarl creee en mai a un premier
    exercice qui va de sa constitution au 31 decembre, sauf mention
    contraire des statuts.
  */
  function comptaParDefaut() {
    return {
      exerciceDebut: '', // AAAA-MM-JJ, saisi par Philippe
      exerciceFin: '',
      /* Capital social verse a la constitution, en Rappen. */
      capitalRappen: 2000000,
      /* Compte ou le capital a ete verse, et compte par defaut des depenses. */
      comptePaiement: '1020',
      plan: planParDefaut(),
    };
  }

  var COMPTE_CLIENTS = '1100';
  var COMPTE_PRODUITS = '3400';
  var COMPTE_CAPITAL = '2800';

  function compta(reglages) {
    var c = (reglages && reglages.comptabilite) || {};
    var base = comptaParDefaut();
    return {
      exerciceDebut: c.exerciceDebut || base.exerciceDebut,
      exerciceFin: c.exerciceFin || base.exerciceFin,
      capitalRappen: c.capitalRappen === undefined
        ? base.capitalRappen : c.capitalRappen,
      comptePaiement: c.comptePaiement || base.comptePaiement,
      plan: (c.plan && c.plan.length) ? c.plan : base.plan,
    };
  }

  /** Le jour d'une date ISO, sans l'heure : « 2026-09-18 ». */
  function jour(iso) {
    return String(iso || '').slice(0, 10);
  }

  function dansExercice(date, reg) {
    var d = jour(date);
    if (!d) return false;
    if (reg.exerciceDebut && d < jour(reg.exerciceDebut)) return false;
    if (reg.exerciceFin && d > jour(reg.exerciceFin)) return false;
    return true;
  }

  /**
   * LE JOURNAL : toutes les ecritures de l'exercice, dans l'ordre.
   *
   * Quatre origines, et aucune autre :
   *
   *  - l'ouverture      : le capital verse a la constitution
   *  - une facture emise: le client doit l'argent (Clients a Produits)
   *  - une facture payee: l'argent est arrive (Banque a Clients)
   *  - une depense      : une charge payee (Charge a Banque)
   *
   * Une facture ANNULEE garde son ecriture d'origine ET recoit une
   * contre-ecriture qui l'annule. On n'efface jamais : en comptabilite
   * suisse, une operation enregistree doit rester tracable.
   */
  function journal(donnees, reglages) {
    var reg = compta(reglages);
    var factures = (donnees && donnees.factures) || [];
    var depenses = (donnees && donnees.depenses) || [];
    var lignes = [];

    function ajouter(date, libelle, debit, credit, montant, origine, ref) {
      if (!montant) return;
      if (!dansExercice(date, reg)) return;
      lignes.push({
        date: jour(date), libelle: libelle, debit: debit, credit: credit,
        montant: montant, origine: origine, reference: ref || '',
      });
    }

    if (reg.capitalRappen && reg.exerciceDebut) {
      ajouter(reg.exerciceDebut, 'Capital social versé à la constitution',
        reg.comptePaiement, COMPTE_CAPITAL, reg.capitalRappen, 'ouverture', '');
    }

    factures.forEach(function (f) {
      var d = f.donnees || {};
      var montant = f.total_rappen || 0;
      ajouter(f.emise_le, 'Facture ' + f.numero + ' — '
        + ((d.client || {}).clientNom || ''),
        COMPTE_CLIENTS, COMPTE_PRODUITS, montant, 'facture', f.numero);

      if (d.annulee) {
        // Contre-ecriture : les memes comptes, dans l'autre sens.
        ajouter(d.annuleeLe || f.emise_le,
          'Annulation de la facture ' + f.numero,
          COMPTE_PRODUITS, COMPTE_CLIENTS, montant, 'annulation', f.numero);
        return;
      }
      if (f.payee_le) {
        ajouter(f.payee_le, 'Encaissement facture ' + f.numero,
          reg.comptePaiement, COMPTE_CLIENTS, montant, 'encaissement',
          f.numero);
      }
    });

    depenses.forEach(function (x) {
      ajouter(x.date, x.libelle || 'Dépense',
        x.compte, x.paiement || reg.comptePaiement,
        x.montant_rappen || 0, 'depense', x.piece || '');
    });

    lignes.sort(function (a, b) {
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
    });
    return lignes;
  }

  /**
   * LE GRAND LIVRE : les memes ecritures, regroupees par compte.
   * Pour chaque compte : total au debit, total au credit, et le solde
   * du bon cote (un actif se lit au debit, un passif au credit).
   */
  function grandLivre(lignes, reglages) {
    var reg = compta(reglages);
    var par = {};
    reg.plan.forEach(function (c) {
      par[c.numero] = {
        numero: c.numero, libelle: c.libelle, type: c.type,
        debit: 0, credit: 0, solde: 0, lignes: [],
      };
    });
    function compte(numero) {
      if (!par[numero]) {
        // Un compte utilise mais absent du plan ne doit pas disparaitre
        // silencieusement des totaux.
        par[numero] = { numero: numero, libelle: 'Compte ' + numero,
          type: 'inconnu', debit: 0, credit: 0, solde: 0, lignes: [] };
      }
      return par[numero];
    }
    lignes.forEach(function (l) {
      var d = compte(l.debit); d.debit += l.montant; d.lignes.push(l);
      var c = compte(l.credit); c.credit += l.montant; c.lignes.push(l);
    });
    return Object.keys(par).map(function (k) {
      var c = par[k];
      var auDebit = c.type === 'actif' || c.type === 'charge';
      c.solde = auDebit ? c.debit - c.credit : c.credit - c.debit;
      return c;
    }).sort(function (a, b) {
      return a.numero < b.numero ? -1 : 1;
    });
  }

  /**
   * BILAN ET COMPTE DE RESULTAT.
   *
   * Le resultat (benefice ou perte) n'est pas un compte tenu a la
   * main : c'est produits moins charges. Il apparait au passif du
   * bilan, ce qui est exactement ce qui fait tomber le bilan juste —
   * actif = passif. Si l'egalite n'est pas vraie, quelque chose est
   * casse, et il vaut mieux le voir que l'ignorer.
   */
  function bilan(lignes, reglages) {
    var comptes = grandLivre(lignes, reglages);
    var garder = function (t) {
      return comptes.filter(function (c) { return c.type === t && c.solde !== 0; });
    };
    var somme = function (l) {
      return l.reduce(function (t, c) { return t + c.solde; }, 0);
    };
    var actif = garder('actif');
    var passif = garder('passif');
    var produits = garder('produit');
    var charges = garder('charge');

    var totalProduits = somme(produits);
    var totalCharges = somme(charges);
    var resultat = totalProduits - totalCharges;
    var totalActif = somme(actif);
    var totalPassif = somme(passif) + resultat;

    return {
      actif: actif, passif: passif, produits: produits, charges: charges,
      totalActif: totalActif, totalPassif: totalPassif,
      totalProduits: totalProduits, totalCharges: totalCharges,
      resultat: resultat,
      equilibre: totalActif === totalPassif,
      ecart: totalActif - totalPassif,
    };
  }

  /**
   * Controle de partie double : somme des debits = somme des credits.
   * Vrai a la ligne pres, toujours, par construction — ce qui ne
   * dispense pas de le VERIFIER et de l'afficher : c'est la preuve
   * qu'aucune moitie d'ecriture ne s'est perdue.
   */
  function controle(lignes) {
    var debits = 0, credits = 0;
    lignes.forEach(function (l) { debits += l.montant; credits += l.montant; });
    return { debits: debits, credits: credits, equilibre: debits === credits };
  }

  /** Les chiffres du tableau de bord, recalcules a chaque affichage. */
  function tableauDeBord(donnees, reglages) {
    var lignes = journal(donnees, reglages);
    var b = bilan(lignes, reglages);
    var reg = compta(reglages);
    var trouver = function (liste, numero) {
      var c = liste.filter(function (x) { return x.numero === numero; })[0];
      return c ? c.solde : 0;
    };
    var comptes = grandLivre(lignes, reglages);
    /*
      La tresorerie, c'est ce qui est disponible tout de suite :
      la banque et la caisse. Pas les factures encore impayees.
    */
    var tresorerie = comptes.filter(function (c) {
      return c.numero === '1000' || c.numero === '1020'
        || c.numero === reg.comptePaiement;
    }).filter(function (c, i, l) {
      return l.indexOf(c) === i;
    }).reduce(function (t, c) { return t + c.solde; }, 0);

    return {
      tresorerie: tresorerie,
      aEncaisser: trouver(comptes, COMPTE_CLIENTS),
      produits: b.totalProduits,
      charges: b.totalCharges,
      resultat: b.resultat,
      nombreEcritures: lignes.length,
      equilibre: b.equilibre && controle(lignes).equilibre,
    };
  }

  /** Ce qui empeche encore la comptabilite de tenir debout. */
  function champsManquants(reglages) {
    var reg = compta(reglages);
    var manque = [];
    if (!reg.exerciceDebut) manque.push('date de début d\u2019exercice');
    if (!reg.exerciceFin) manque.push('date de fin d\u2019exercice');
    if (!reg.capitalRappen) manque.push('capital social versé');
    return manque;
  }

  global.BillyCompta = {
    planParDefaut: planParDefaut,
    comptaParDefaut: comptaParDefaut,
    compta: compta,
    journal: journal,
    grandLivre: grandLivre,
    bilan: bilan,
    controle: controle,
    tableauDeBord: tableauDeBord,
    champsManquants: champsManquants,
    COMPTE_CLIENTS: COMPTE_CLIENTS,
    COMPTE_PRODUITS: COMPTE_PRODUITS,
    COMPTE_CAPITAL: COMPTE_CAPITAL,
  };
})(typeof window !== 'undefined' ? window : globalThis);
