# Guide d'installation — Décroche

## 1. Prérequis
- Node.js 20+ installé (https://nodejs.org)
- Un compte GitHub
- Un compte Supabase (gratuit) : https://supabase.com
- Un compte francetravail.io (gratuit) si tu veux les vraies offres France Travail

## 2. Installer le projet en local
```bash
npm install
cp .env.example .env.local
```
Remplis `.env.local` avec tes clés (étapes 3 et 4).

```bash
npm run dev
```
Le site est alors visible sur http://localhost:5173

## 3. Créer le projet Supabase
1. Sur supabase.com, crée un nouveau projet.
2. Dans **Project Settings > API**, copie `Project URL` et `anon public key`
   dans `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`.
3. Dans **SQL Editor**, colle le contenu de `supabase/schema.sql` et exécute-le.
   Ça crée toutes les tables (profils, offres, likes, sauvegardes, candidatures,
   signalements) avec la sécurité (RLS) déjà configurée.
4. Dans **Authentication > Providers**, active Email et, si tu veux, Google.
5. Pour rendre un compte admin : dans **Table Editor > profiles**, trouve la
   ligne du compte concerné et passe `is_admin` à `true`.

## 4. Activer l'API France Travail (optionnel mais gratuit)
1. Crée un compte sur https://francetravail.io
2. Crée une application, active le produit **"Offres d'emploi v2"**.
3. Copie ton `client_id` / `client_secret` dans `.env.local`.
4. **Important (sécurité)** : le flux OAuth2 de France Travail utilise un
   `client_secret`. Ne l'appelle jamais directement depuis le navigateur en
   production — crée une Supabase Edge Function qui fait cet appel côté
   serveur, et fais appeler cette fonction par le frontend à la place de
   `FranceTravailSource.ts` directement.

## 5. HelloWork / Indeed
Aucune des deux ne propose d'accès self-service gratuit aujourd'hui.
- Indeed : programme "Indeed Publisher" (candidature manuelle, validation par Indeed).
- HelloWork : partenariat commercial direct à négocier avec eux.
Les connecteurs sont prêts dans `src/services/sources/` — le jour où l'accès
est obtenu, seul le contenu de leur `search()` doit changer.

## 6. Déployer sur GitHub Pages
1. Crée un dépôt GitHub nommé `decroche` (ou adapte `base` dans `vite.config.ts`
   et `basename` dans `src/main.tsx` si tu choisis un autre nom).
2. Dans **Settings > Pages**, source = "GitHub Actions".
3. Dans **Settings > Secrets and variables > Actions**, ajoute les 4 secrets :
   `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
   `VITE_FRANCETRAVAIL_CLIENT_ID`, `VITE_FRANCETRAVAIL_CLIENT_SECRET`.
4. `git push` sur `main` : le workflow `.github/workflows/deploy.yml` build et
   déploie automatiquement.

## 7. Avant une vraie mise en ligne publique
- Faire relire `docs/RGPD.md` par un professionnel (données de mineurs).
- Implémenter le consentement parental pour les moins de 15 ans.
- Créer une Edge Function `delete-account` (suppression de compte RGPD),
  référencée dans `authService.ts`.
- Ajouter de vraies icônes PWA dans `public/icons/` (192×192 et 512×512).
- Relier l'UI riche du prototype (`decroche-app.jsx` envoyé précédemment) à
  ce squelette connecté, en remplaçant les données démo par `jobsService.ts`.
