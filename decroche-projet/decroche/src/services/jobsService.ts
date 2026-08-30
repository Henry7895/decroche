import { supabase } from "../lib/supabaseClient";
import { searchAllSources } from "./sources";
import { JobSourceParams } from "./sources/JobSource";

// Récupère les offres : combine les offres stockées en base (démo + collectivités
// + associations saisies manuellement par un admin) avec les sources externes en direct.
export async function fetchJobs(params: JobSourceParams) {
  const [{ data: dbJobs, error }, externalJobs] = await Promise.all([
    supabase.from("jobs").select("*"),
    searchAllSources(params),
  ]);
  if (error) throw error;
  return [...(dbJobs ?? []), ...externalJobs];
}

export async function toggleLike(userId: string, jobId: string, jobSource: string) {
  const { data: existing } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    await supabase.from("likes").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("likes").insert({ user_id: userId, job_id: jobId, job_source: jobSource });
  return true;
}

export async function toggleSave(userId: string, jobId: string, jobSource: string) {
  const { data: existing } = await supabase
    .from("saves")
    .select("id")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saves").delete().eq("id", existing.id);
    return false;
  }
  await supabase.from("saves").insert({ user_id: userId, job_id: jobId, job_source: jobSource });
  return true;
}

export type ApplicationStatus =
  | "a_contacter" | "a_faire" | "envoyee" | "en_attente" | "entretien" | "acceptee" | "refusee";

export async function upsertApplication(userId: string, jobId: string, status: ApplicationStatus) {
  const { error } = await supabase
    .from("applications")
    .upsert({ user_id: userId, job_id: jobId, status, updated_at: new Date().toISOString() }, { onConflict: "user_id,job_id" });
  if (error) throw error;
}

export async function reportJob(userId: string, jobId: string, reason: string) {
  const { error } = await supabase.from("reports").insert({ user_id: userId, job_id: jobId, reason });
  if (error) throw error;
}
