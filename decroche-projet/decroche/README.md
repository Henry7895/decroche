# Décroche

⚠️ **Ne double-clique jamais sur `index.html`** — ça donnera une page
blanche. Ce projet doit être lancé avec `npm run dev` (voir ci-dessous), qui
ouvre une vraie adresse `http://localhost:...` dans le navigateur.

Plateforme de jobs pour les 14-18 ans. Voir `docs/SETUP.md` pour l'installation
pas à pas, et `docs/RGPD.md` pour la politique de confidentialité.

## État du projet

✅ **Réellement fonctionnel** (une fois tes clés remplies dans `.env.local`) :
- Comptes réels (inscription, connexion, Google, mot de passe oublié) via Supabase Auth
- Base de données réelle avec sécurité (RLS) : profils, offres, likes, sauvegardes, candidatures, signalements
- Export de données et suppression de compte (droits RGPD)
- Connecteur France Travail réel (OAuth2 + recherche d'offres officielles)
- Dashboard admin connecté à la vraie base (compteurs, signalements, vérifier/supprimer une offre)
- Générateur de CV (aperçu live + export PDF) et de lettre de motivation
- PWA (manifest, service worker, installable)
- Déploiement automatique GitHub Pages via GitHub Actions
- **Interface animée avec [Motion](https://motion.dev)** (vrai paquet npm, celui qui fait tourner Animate UI) : `npm run build` a été testé et passe.
  - `src/components/motion/AnimatedNav.tsx` — nav avec pastille active qui glisse réellement d'un onglet à l'autre (`layoutId`)
  - `src/components/motion/SettingsPanel.tsx` — menu paramètres animé (spring, `AnimatePresence`), thème sombre par défaut / clair au choix
  - `src/components/motion/SwipeDeck.tsx` — vrai swipe à glisser (drag physique Motion, rotation et libellés J'AIME/PASSE dérivés du geste, sortie animée)
  - `src/App.tsx` — assemble tout ça avec des transitions de page animées

⚠️ **Pas branché / pas possible aujourd'hui** :
- HelloWork et Indeed : pas d'API publique gratuite — connecteurs prêts mais vides tant qu'aucun partenariat n'est signé (voir `docs/SETUP.md`)
- Consentement parental pour les moins de 15 ans (obligatoire légalement, pas encore implémenté)
- `App.tsx` utilise encore `DEMO_JOBS` (données en mémoire) plutôt que `jobsService.fetchJobs()` — prochaine étape logique une fois Supabase configuré
- Les composants Animate UI / React Bits eux-mêmes s'installent via leur propre CLI (basée sur celle de shadcn), dont le registre n'est pas joignable depuis mon environnement — mais comme les deux sont construits sur Motion, les composants ci-dessus donnent le même type de rendu, écrits à la main avec la même librairie

## Démarrage rapide
```bash
npm install
cp .env.example .env.local   # puis remplis tes clés — voir docs/SETUP.md
npm run dev
```
