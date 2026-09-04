/* ============================================================
   BillyPro Suisse — ouverture hors ligne

   A QUOI CA SERT
   Dans une cave ou des combles sans 4G, une page web ne s'ouvre
   tout simplement pas : le navigateur ne peut pas aller chercher
   les fichiers. Ce petit programme les garde en reserve sur
   l'appareil.

   STRATEGIE : LE RESEAU D'ABORD.
   Chaque fois que le reseau repond, on prend la version fraiche et
   on met la reserve a jour. La reserve ne sert QUE lorsque le
   reseau manque.

   C'est volontaire. La strategie inverse — la reserve d'abord —
   est plus rapide, mais elle sert des fichiers perimes : Philippe
   publierait une correction sur GitHub et continuerait a voir
   l'ancienne version, sans comprendre pourquoi. Sur un outil qui
   evolue chaque semaine, c'est inacceptable.
   ============================================================ */

// Change ce numero a chaque livraison : il force le nettoyage des
// anciennes reserves.
const VERSION = 'billy-2026-09-04b';

const FICHIERS = [
  './',
  './index.html',
  './moteur-billy.js',
  './qr-facture.js',
  './logique.js',
  './depot.js',
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(
    caches.open(VERSION)
      // `addAll` echoue en bloc si UN fichier manque. On ajoute donc
      // un par un : mieux vaut une reserve incomplete que pas de
      // reserve du tout.
      .then((c) => Promise.all(
        FICHIERS.map((f) => c.add(f).catch(() => null)),
      ))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((noms) => Promise.all(
        noms.filter((n) => n !== VERSION).map((n) => caches.delete(n)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // On ne garde EN RESERVE que nos propres fichiers. Mettre en cache
  // les reponses de Supabase donnerait des donnees perimees sans
  // qu'on sache lesquelles — bien pire qu'une erreur franche.
  if (url.origin !== self.location.origin) return;

  ev.respondWith(
    fetch(req)
      .then((rep) => {
        if (rep && rep.ok) {
          const copie = rep.clone();
          caches.open(VERSION).then((c) => c.put(req, copie)).catch(() => {});
        }
        return rep;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
});
