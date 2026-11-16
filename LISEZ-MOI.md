# BillyPro — version vendable (séparée de ton Billy actuel)

Rien ici ne touche ton app actuelle : autre dossier, autre serveur (config.js vide), autre stockage sur le téléphone.

## Pour la mettre en route (une seule fois)
1. supabase.com → **New project** (nouveau, pas « billypro-suisse »).
2. SQL Editor → coller tout `serveur-billypro.sql` → Run.
3. Settings → API : copier l'URL et la clé « publishable » dans `config.js`.
4. Héberger le dossier sur un nom de domaine (Netlify, par exemple).

## Ce qui est nouveau
- Inscription « Créer mon entreprise » (essai 30 jours), chaque entreprise isolée.
- Abonnement : bandeau d'essai ; une entreprise expirée peut lire mais plus écrire (bloqué par le serveur). Activation manuelle par toi (dernière ligne du SQL) en attendant le paiement en ligne.
- App installable (manifest), plus aucune mention de ton entreprise par défaut.

## Pas encore fait
Paiement en ligne, site de présentation, CGV/confidentialité (case à cocher présente, textes à écrire), parcours de démarrage guidé, dépenses côté serveur, stores Apple/Google.
