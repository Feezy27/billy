/* ============================================================
   BillyPro Suisse — le depot de donnees
   ============================================================

   A QUOI CA SERT
   Toutes les pages passent par ici pour lire et ecrire. Elles ne
   savent PAS ou vivent les donnees. C'est ce qui permet de
   travailler des aujourd'hui sans compte Supabase, puis de brancher
   Supabase plus tard sans retoucher une seule page.

   Deux depots :
   - DepotLocal    : dans ce navigateur. Aucun compte, rien a
                     installer. Les donnees restent sur CET appareil.
   - DepotSupabase : partage entre les appareils et entre les
                     membres de l'entreprise.

   Le choix est automatique : si les cles Supabase sont renseignees
   dans index.html, c'est Supabase ; sinon, le local.
   ============================================================ */

(function (global) {
  'use strict';

  var PREFIXE = 'billyswiss.';

  /* ---------- utilitaires ---------- */

  function lire(cle, defaut) {
    try {
      var brut = global.localStorage.getItem(PREFIXE + cle);
      return brut ? JSON.parse(brut) : defaut;
    } catch (e) {
      // Valeur abimee ou navigation privee : on repart du defaut
      // plutot que de bloquer l'application.
      return defaut;
    }
  }

  function ecrire(cle, valeur) {
    try {
      global.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Depot local ---------- */

  function DepotLocal() {
    this.mode = 'local';
  }

  DepotLocal.prototype.pret = function () {
    return Promise.resolve(true);
  };

  DepotLocal.prototype.lireReglages = function () {
    return Promise.resolve(lire('reglages', null));
  };

  DepotLocal.prototype.ecrireReglages = function (r) {
    ecrire('reglages', r);
    return Promise.resolve(r);
  };

  DepotLocal.prototype.listerInterventions = function () {
    return Promise.resolve(lire('interventions', []));
  };

  DepotLocal.prototype.enregistrerIntervention = function (it) {
    var toutes = lire('interventions', []);
    var i = toutes.findIndex(function (x) { return x.id === it.id; });
    if (i >= 0) toutes[i] = it; else toutes.push(it);
    ecrire('interventions', toutes);
    return Promise.resolve(it);
  };

  DepotLocal.prototype.listerFactures = function () {
    return Promise.resolve(lire('factures', []));
  };

  /**
   * Numero de facture, version locale.
   *
   * ATTENTION — limite assumee et documentee : ce compteur vit dans
   * CE navigateur. Tant que Philippe facture seul depuis un seul
   * appareil, il est juste. Des que deux appareils facturent, seul
   * le compteur Supabase (fonction prochain_numero_facture) garantit
   * l'absence de doublon : c'est PostgreSQL qui tranche, et il ne
   * peut pas se tromper.
   *
   * Le site francais utilise cette methode-la EN PERMANENCE, y
   * compris a plusieurs. Dix facturations simultanees y produisent
   * sept doublons.
   */
  DepotLocal.prototype.prochainNumeroFacture = function (serie) {
    serie = serie || 'F';
    var annee = new Date().getFullYear();
    var compteurs = lire('compteurs', {});
    var cle = serie + '-' + annee;
    compteurs[cle] = (compteurs[cle] || 0) + 1;
    ecrire('compteurs', compteurs);
    var n = String(compteurs[cle]);
    while (n.length < 4) n = '0' + n;
    return Promise.resolve(serie + n + '-' + annee);
  };

  DepotLocal.prototype.enregistrerFacture = function (f) {
    var toutes = lire('factures', []);
    var i = toutes.findIndex(function (x) { return x.id === f.id; });
    if (i >= 0) toutes[i] = f; else toutes.push(f);
    ecrire('factures', toutes);
    return Promise.resolve(f);
  };

  /* ---------- Depot Supabase ---------- */

  /*
    Supabase renvoie ses erreurs comme de simples objets. Les relancer
    tels quels fait perdre le message en chemin et casse les
    verifications habituelles. On en fait de vraies erreurs, avec un
    texte lisible : une facture qui ne s'enregistre pas en silence
    serait pire que tout.
  */
  function verifier(r) {
    if (r && r.error) {
      throw new Error(r.error.message || 'Erreur Supabase');
    }
    return r;
  }

  function DepotSupabase(client) {
    this.mode = 'supabase';
    this.client = client;
  }

  DepotSupabase.prototype.pret = function () {
    return this.client.auth.getUser().then(function (r) {
      return !!(r && r.data && r.data.user);
    });
  };

  /*
    Le site ne connait PAS l'identifiant de son entreprise, et il n'a
    pas a le connaitre. Deux fonctions de la base s'en chargent : elles
    agissent sur l'entreprise de la personne connectee, et sur elle
    seule. Impossible d'ecrire chez quelqu'un d'autre, meme par erreur.
  */
  DepotSupabase.prototype.lireReglages = function () {
    return this.client.rpc('mes_reglages').then(function (r) {
      verifier(r);
      // Une entreprise neuve a des reglages vides : on renvoie null
      // pour que le site parte de ses valeurs par defaut suisses.
      return (r.data && Object.keys(r.data).length) ? r.data : null;
    });
  };

  DepotSupabase.prototype.ecrireReglages = function (reglages) {
    return this.client.rpc('enregistrer_reglages', { p_reglages: reglages })
      .then(function (r) { verifier(r); return reglages; });
  };

  DepotSupabase.prototype.listerInterventions = function () {
    return this.client.from('rdvs').select('*').is('supprime_le', null)
      .order('debut_le', { ascending: false })
      .then(function (r) { verifier(r); return r.data || []; });
  };

  /*
    `entreprise_id` n'est PAS envoye : la base le remplit elle-meme a
    partir de qui est connecte (DEFAULT mon_entreprise()). L'envoyer
    depuis le navigateur serait a la fois inutile et dangereux.
  */
  DepotSupabase.prototype.enregistrerIntervention = function (it) {
    return this.client.from('rdvs').upsert(it)
      .then(function (r) { verifier(r); return it; });
  };

  DepotSupabase.prototype.listerFactures = function () {
    return this.client.from('factures').select('*')
      .order('emise_le', { ascending: false })
      .then(function (r) { verifier(r); return r.data || []; });
  };

  /** C'est PostgreSQL qui attribue le numero, pas le navigateur. */
  DepotSupabase.prototype.prochainNumeroFacture = function (serie) {
    return this.client.rpc('prochain_numero_facture', { p_serie: serie || 'F' })
      .then(function (r) { verifier(r); return r.data; });
  };

  DepotSupabase.prototype.enregistrerFacture = function (f) {
    return this.client.from('factures').upsert(f)
      .then(function (r) { verifier(r); return f; });
  };

  /* ---------- Choix automatique ---------- */

  function choisirDepot(url, cle, fabriqueClient) {
    if (url && cle && fabriqueClient) {
      try {
        return new DepotSupabase(fabriqueClient(url, cle));
      } catch (e) {
        // Cles erronees : on ne bloque pas Philippe, on retombe en
        // local et l'ecran le dira clairement.
      }
    }
    return new DepotLocal();
  }

  global.BillyDepot = {
    DepotLocal: DepotLocal,
    DepotSupabase: DepotSupabase,
    choisirDepot: choisirDepot,
  };
})(typeof window !== 'undefined' ? window : globalThis);
