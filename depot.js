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

  /*
    DEFAUT VECU, ET SERIEUX.

    Ouverte par double-clic depuis le disque (file://), une page n'a
    PAS le droit d'utiliser le stockage du navigateur : l'origine est
    dite « opaque » et toute ecriture est refusee.

    Consequences observees : rien n'etait conserve d'un rechargement a
    l'autre, et surtout le compteur de factures repartait a zero —
    deux factures differentes recevaient le numero F0001.

    On garde donc une memoire de session en repli. Elle ne survit pas
    a la fermeture de l'onglet, mais elle empeche le pire : deux
    factures avec le meme numero dans une meme session. Et
    `persistant` permet a l'ecran de PREVENIR au lieu de laisser
    croire que tout est enregistre.
  */
  var memoire = {};
  var persistant = (function () {
    try {
      global.localStorage.setItem(PREFIXE + 'essai', '1');
      global.localStorage.removeItem(PREFIXE + 'essai');
      return true;
    } catch (e) {
      return false;
    }
  })();

  function lire(cle, defaut) {
    try {
      if (!persistant) {
        return memoire[cle] === undefined ? defaut : memoire[cle];
      }
      var brut = global.localStorage.getItem(PREFIXE + cle);
      return brut ? JSON.parse(brut) : defaut;
    } catch (e) {
      // Valeur abimee : on repart du defaut plutot que de bloquer.
      return defaut;
    }
  }

  function ecrire(cle, valeur) {
    if (!persistant) { memoire[cle] = valeur; return false; }
    try {
      global.localStorage.setItem(PREFIXE + cle, JSON.stringify(valeur));
      return true;
    } catch (e) {
      // Quota plein : on bascule en memoire pour ne rien perdre
      // pendant cette session.
      persistant = false;
      memoire[cle] = valeur;
      return false;
    }
  }

  /* ---------- Depot local ---------- */

  function DepotLocal() {
    this.mode = 'local';
    /** Faux quand le navigateur refuse le stockage : tout sera perdu
        a la fermeture de l'onglet. L'ecran doit le dire. */
    this.persistant = persistant;
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
    return Promise.resolve(lire('interventions', []).filter(function (x) {
      return !x.supprime_le;
    }));
  };

  DepotLocal.prototype.enregistrerIntervention = function (it) {
    var toutes = lire('interventions', []);
    var i = toutes.findIndex(function (x) { return x.id === it.id; });
    if (i >= 0) toutes[i] = it; else toutes.push(it);
    ecrire('interventions', toutes);
    return Promise.resolve(it);
  };

  /*
    Suppression DOUCE : la ligne est marquee, jamais effacee. Deux
    raisons. La synchronisation doit pouvoir propager la suppression
    aux autres appareils — une ligne disparue ne se propage pas. Et
    une suppression par erreur reste rattrapable.
  */
  DepotLocal.prototype.supprimerIntervention = function (id) {
    var toutes = lire('interventions', []);
    var i = toutes.findIndex(function (x) { return x.id === id; });
    if (i >= 0) {
      toutes[i].supprime_le = new Date().toISOString();
      ecrire('interventions', toutes);
    }
    return Promise.resolve(true);
  };

  /* Une equipe n'a de sens qu'en ligne : en local, chaque appareil
     est seul avec ses donnees. */
  DepotLocal.prototype.listerMembres = function () {
    return Promise.resolve(null);
  };

  DepotLocal.prototype.rattacherCollegue = function () {
    return Promise.reject(new Error(
      'Connectez-vous d\u2019abord : une equipe suppose des donnees partagees.'));
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
  /*
    Distingue « pas de reseau » de « le serveur refuse ».

    La difference est essentielle : une panne de reseau se retente,
    un refus du serveur ne se retentera jamais avec succes et
    bloquerait la file indefiniment.
  */
  function estReseau(e) {
    var m = String((e && e.message) || e || '');
    return /fetch|network|réseau|reseau|Failed|offline|NetworkError/i.test(m);
  }

  function verifier(r) {
    if (r && r.error) {
      throw new Error(r.error.message || 'Erreur Supabase');
    }
    return r;
  }

  /*
    MIROIR LOCAL.

    Sans reseau, `select` echoue et l'ecran reste vide. Or les donnees
    ont deja ete telechargees : les jeter serait absurde.

    Chaque lecture reussie est donc recopiee sur l'appareil. Quand le
    reseau manque, on ressort cette copie — en le DISANT, parce qu'un
    agenda perime presente comme a jour est pire qu'un agenda vide.

    On ne recopie que ce qui se consulte sur le terrain. Les factures
    et les reglages suivent : sans eux, impossible de retrouver un
    montant ou un tarif dans une cave.
  */
  function DepotSupabase(client) {
    this.mode = 'supabase';
    this.client = client;
    DepotSupabase.dernier = this;
    /** Vrai quand la derniere lecture a du puiser dans le miroir. */
    this.horsLigne = false;
  }

  DepotSupabase.prototype.enMiroir = function (cle, valeur) {
    ecrire('miroir.' + cle, valeur);
    ecrire('miroir.date', new Date().toISOString());
    return valeur;
  };

  DepotSupabase.prototype.duMiroir = function (cle, defaut) {
    this.horsLigne = true;
    return lire('miroir.' + cle, defaut);
  };

  /** Date de la derniere lecture reussie, pour l'afficher. */
  DepotSupabase.prototype.dateMiroir = function () {
    return lire('miroir.date', null);
  };

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
    var self = this;
    return this.client.rpc('mes_reglages').then(function (r) {
      verifier(r);
      self.horsLigne = false;
      // Une entreprise neuve a des reglages vides : on renvoie null
      // pour que le site parte de ses valeurs par defaut suisses.
      var v = (r.data && Object.keys(r.data).length) ? r.data : null;
      return self.enMiroir('reglages', v);
    }).catch(function (e) {
      var copie = self.duMiroir('reglages', undefined);
      // Aucune copie : on ne peut rien faire, l'erreur doit remonter.
      if (copie === undefined) throw e;
      return copie;
    });
  };

  DepotSupabase.prototype.envoyerReglages = function (reglages) {
    return this.client.rpc('enregistrer_reglages', { p_reglages: reglages })
      .then(function (r) { verifier(r); return reglages; });
  };

  DepotSupabase.prototype.ecrireReglages = function (reglages) {
    var self = this;
    return this.envoyerReglages(reglages).catch(function (e) {
      if (!estReseau(e)) throw e;
      var op = { type: 'reglages', id: 'reglages', valeur: reglages };
      self.miroirAppliquer(op); enFile(op);
      return reglages;
    });
  };

  DepotSupabase.prototype.listerInterventions = function () {
    var self = this;
    return this.client.from('rdvs').select('*').is('supprime_le', null)
      .order('debut_le', { ascending: false })
      .then(function (r) {
        verifier(r);
        self.horsLigne = false;
        return self.enMiroir('interventions', r.data || []);
      })
      .catch(function () { return self.duMiroir('interventions', []); });
  };

  /*
    `entreprise_id` n'est PAS envoye : la base le remplit elle-meme a
    partir de qui est connecte (DEFAULT mon_entreprise()). L'envoyer
    depuis le navigateur serait a la fois inutile et dangereux.
  */
  DepotSupabase.prototype.envoyerIntervention = function (it) {
    return this.client.from('rdvs').upsert(it)
      .then(function (r) { verifier(r); return it; });
  };

  DepotSupabase.prototype.enregistrerIntervention = function (it) {
    var self = this;
    return this.envoyerIntervention(it).catch(function (e) {
      if (!estReseau(e)) throw e;
      var op = { type: 'intervention', id: it.id, valeur: it };
      self.miroirAppliquer(op); enFile(op);
      return it;
    });
  };

  /* ------------------------------------------------------------
     FILE D'ATTENTE

     Sans reseau, une ecriture echoue et le travail est perdu : une
     intervention terminee dans une cave, un rendez-vous deplace au
     telephone. On met donc le geste en file, on l'applique tout de
     suite a la copie locale — pour que l'ecran montre la verite — et
     on le rejoue au retour du reseau.

     L'identifiant est fabrique par le navigateur AVANT l'envoi.
     Rejouer deux fois le meme geste ecrit donc la meme ligne : aucun
     doublon, meme si la synchronisation part deux fois.
     ------------------------------------------------------------ */

  function enFile(op) {
    // Un geste mis en file signifie que le reseau manque. L'ecran doit
    // le savoir : sans cela, le bandeau conseillerait « rouvrez dans
    // une zone couverte » a quelqu'un qui est justement hors zone.
    if (DepotSupabase.dernier) DepotSupabase.dernier.horsLigne = true;
    var file = lire('file', []);
    // Un meme objet reecrit plusieurs fois hors ligne ne doit occuper
    // qu'une place : c'est son dernier etat qui compte.
    var i = file.findIndex(function (x) {
      return x.type === op.type && x.id === op.id;
    });
    if (i >= 0) file[i] = op; else file.push(op);
    ecrire('file', file);
    return file.length;
  }

  DepotSupabase.prototype.enAttente = function () {
    return lire('file', []).length;
  };

  /** Applique un geste a la copie locale, pour que l'ecran soit juste. */
  DepotSupabase.prototype.miroirAppliquer = function (op) {
    if (op.type === 'reglages') { ecrire('miroir.reglages', op.valeur); return; }
    var cle = (op.type === 'facture') ? 'miroir.factures' : 'miroir.interventions';
    var liste = lire(cle, []);
    var i = liste.findIndex(function (x) { return x.id === op.id; });
    if (op.type === 'suppression') {
      if (i >= 0) liste.splice(i, 1);
    } else if (i >= 0) { liste[i] = op.valeur; } else { liste.unshift(op.valeur); }
    ecrire(cle, liste);
  };

  /**
   * Rejoue la file. Renvoie { envoyes, restants }.
   * Un geste qui echoue pour une raison AUTRE que le reseau est
   * retire : le garder bloquerait la file pour toujours.
   */
  DepotSupabase.prototype.synchroniser = function () {
    var self = this;
    var file = lire('file', []);
    if (!file.length) return Promise.resolve({ envoyes: 0, restants: 0 });

    var envoyes = 0;
    var reste = [];
    var refuses = [];

    function suivant(i) {
      if (i >= file.length) {
        ecrire('file', reste);
        return { envoyes: envoyes, restants: reste.length, refuses: refuses };
      }
      var op = file[i];
      var envoi = (op.type === 'reglages')
        ? self.envoyerReglages(op.valeur)
        : (op.type === 'facture')
          ? self.envoyerFacture(op.valeur)
          : (op.type === 'suppression')
            ? self.envoyerSuppression(op.id)
            : self.envoyerIntervention(op.valeur);

      return envoi.then(function () { envoyes++; })
        .catch(function (e) {
          if (/fetch|network|réseau|reseau|Failed/i.test(String(e.message || e))) {
            reste.push(op);        // toujours hors ligne : on garde
          } else {
            refuses.push({ op: op, raison: e.message || String(e) });
          }
        })
        .then(function () { return suivant(i + 1); });
    }
    return suivant(0);
  };

  DepotSupabase.prototype.envoyerSuppression = function (id) {
    return this.client.from('rdvs')
      .update({ supprime_le: new Date().toISOString() }).eq('id', id)
      .then(function (r) { verifier(r); return true; });
  };

  DepotSupabase.prototype.supprimerIntervention = function (id) {
    var self = this;
    return this.envoyerSuppression(id).catch(function (e) {
      if (!estReseau(e)) throw e;
      var op = { type: 'suppression', id: id };
      self.miroirAppliquer(op); enFile(op);
      return true;
    });
  };

  DepotSupabase.prototype.listerMembres = function () {
    return this.client.from('membres').select('user_id, nom, role')
      .then(function (r) { verifier(r); return r.data || []; });
  };

  /*
    Rattache un compte existant a CETTE entreprise. La verification et
    le nettoyage vivent dans PostgreSQL (fonction rattacher_collegue) :
    le navigateur n'a pas a connaitre les identifiants internes, et ne
    peut donc pas rattacher quelqu'un a l'entreprise d'un autre.
  */
  DepotSupabase.prototype.rattacherCollegue = function (email, role) {
    return this.client.rpc('rattacher_collegue',
      { p_email: email, p_role: role || 'terrain' })
      .then(function (r) { verifier(r); return r.data; });
  };

  DepotSupabase.prototype.listerFactures = function () {
    var self = this;
    return this.client.from('factures').select('*')
      .order('emise_le', { ascending: false })
      .then(function (r) {
        verifier(r);
        self.horsLigne = false;
        return self.enMiroir('factures', r.data || []);
      })
      .catch(function () { return self.duMiroir('factures', []); });
  };

  /** C'est PostgreSQL qui attribue le numero, pas le navigateur. */
  /*
    Le numero, lui, ne peut PAS etre attribue hors ligne : seul le
    compteur de PostgreSQL garantit qu'il n'existe pas deja. En
    inventer un au telephone, c'est exactement le defaut du site
    francais — sept doublons sur dix facturations simultanees.

    On refuse donc, avec un message qui dit quoi faire. Le travail,
    lui, est deja enregistre : il suffira de facturer au retour.
  */
  DepotSupabase.prototype.prochainNumeroFacture = function (serie) {
    return this.client.rpc('prochain_numero_facture', { p_serie: serie || 'F' })
      .then(function (r) { verifier(r); return r.data; })
      .catch(function (e) {
        if (estReseau(e)) {
          throw new Error('Sans réseau, impossible d\u2019attribuer un numéro : '
            + 'il pourrait exister déjà. L\u2019intervention est enregistrée, '
            + 'facturez-la de retour dans une zone couverte.');
        }
        throw e;
      });
  };

  DepotSupabase.prototype.envoyerFacture = function (f) {
    return this.client.from('factures').upsert(f)
      .then(function (r) { verifier(r); return f; });
  };

  DepotSupabase.prototype.enregistrerFacture = function (f) {
    var self = this;
    return this.envoyerFacture(f).catch(function (e) {
      if (!estReseau(e)) throw e;
      var op = { type: 'facture', id: f.id, valeur: f };
      self.miroirAppliquer(op); enFile(op);
      return f;
    });
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
