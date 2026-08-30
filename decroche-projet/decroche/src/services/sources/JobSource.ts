import { Job } from "../../types/job";

// Chaque connecteur de source d'offres implémente cette interface.
// Ça garantit que jobsService peut agréger toutes les sources de la même façon,
// sans se soucier de comment chacune récupère ses données.
export interface JobSourceParams {
  ville?: string;
  rayonKm?: number;
  ageMax?: number;
  categorie?: string;
  motCle?: string;
}

export interface JobSource {
  name: Job["source"];
  search(params: JobSourceParams): Promise<Job[]>;
}
