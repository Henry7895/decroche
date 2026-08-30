import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  // En dev, ça évite un plantage silencieux si .env.local n'est pas rempli.
  console.warn(
    "[supabaseClient] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY manquants. " +
      "Copie .env.example vers .env.local et remplis tes clés (voir docs/SETUP.md)."
  );
}

export const supabase = createClient(url, anonKey);
