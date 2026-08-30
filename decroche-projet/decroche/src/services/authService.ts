import { supabase } from "../lib/supabaseClient";

export async function signUp(email: string, password: string, pseudo: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { pseudo } }, // stocké dans user_metadata
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// Suppression de compte (RGPD, "droit à l'oubli") : nécessite une fonction
// serveur avec la clé service_role (jamais côté client). Voir docs/SETUP.md
// pour créer une Supabase Edge Function "delete-account".
export async function requestAccountDeletion() {
  const { error } = await supabase.functions.invoke("delete-account");
  if (error) throw error;
}

// Export des données personnelles (RGPD, droit à la portabilité).
export async function exportMyData() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Non connecté");
  const [likes, saves, applications] = await Promise.all([
    supabase.from("likes").select("*").eq("user_id", user.user.id),
    supabase.from("saves").select("*").eq("user_id", user.user.id),
    supabase.from("applications").select("*").eq("user_id", user.user.id),
  ]);
  return {
    profil: user.user,
    likes: likes.data ?? [],
    sauvegardes: saves.data ?? [],
    candidatures: applications.data ?? [],
  };
}
