import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "decroche" = nom du repo GitHub. Adapter si le repo a un autre nom,
// car GitHub Pages sert le site depuis /<nom-du-repo>/.
export default defineConfig({
  plugins: [react()],
  base: "/decroche/",
});
