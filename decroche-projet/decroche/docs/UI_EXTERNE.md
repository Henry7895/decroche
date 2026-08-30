# Installer les vrais composants Animate UI / React Bits

Je ne peux pas exécuter ces commandes depuis mon environnement (le registre de
ces sites n'est pas joignable depuis mon bac à sable), mais elles fonctionnent
normalement depuis ton terminal une fois le projet cloné chez toi.

## Animate UI (construit sur Motion + CLI shadcn)
```bash
npx shadcn@latest init          # une seule fois, si pas déjà fait
npx shadcn@latest add https://animate-ui.com/r/tabs.json
npx shadcn@latest add https://animate-ui.com/r/sidebar.json
npx shadcn@latest add https://animate-ui.com/r/dialog.json
```
Va sur https://animate-ui.com, ouvre la page du composant qui t'intéresse
(menu, tabs, drawer...), et copie la commande `npx shadcn@latest add ...`
affichée en haut de la page — le nom exact du composant peut avoir changé
depuis la rédaction de ce fichier.

## React Bits (version gratuite, open source)
```bash
npx shadcn@latest add https://reactbits.dev/r/AnimatedList.json
npx shadcn@latest add https://reactbits.dev/r/Carousel.json
```
⚠️ Attention : reactbits.dev a une offre payante ("React Bits Pro",
pro.reactbits.dev) pour ses composants les plus avancés (navbars avec
indicateur animé, mega-menus...). Vérifie sur la page du composant s'il
s'agit de la version gratuite avant de l'installer — je n'ai pas de visibilité
sur ce qui est gratuit ou payant aujourd'hui.

## Une fois installés
Les composants atterrissent dans `src/components/ui/`. Remplace ensuite les
imports dans `AnimatedNav.tsx` / `SwipeDeck.tsx` / `SettingsPanel.tsx` par les
vrais composants installés, à la place de mes versions écrites à la main.
