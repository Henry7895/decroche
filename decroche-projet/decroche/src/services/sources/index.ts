import { Job } from "../../types/job";
import { JobSource, JobSourceParams } from "./JobSource";
import { HelloWorkSource } from "./HelloWorkSource";
import { IndeedSource } from "./IndeedSource";
import { FranceTravailSource } from "./FranceTravailSource";

const SOURCES: JobSource[] = [FranceTravailSource, HelloWorkSource, IndeedSource];

// Interroge toutes les sources en parallèle et fusionne les résultats.
// Si une source échoue (clé manquante, API en panne...), elle est simplement
// ignorée plutôt que de faire planter toute la recherche.
export async function searchAllSources(params: JobSourceParams): Promise<Job[]> {
  const results = await Promise.allSettled(SOURCES.map((s) => s.search(params)));
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}
