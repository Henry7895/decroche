import { Job } from "../../types/job";
import { JobSource, JobSourceParams } from "./JobSource";

/**
 * HelloWork ne propose pas d'API publique de recherche d'offres en libre accès
 * (contrairement à France Travail). Pour l'intégrer réellement il faut soit :
 *   1. Devenir partenaire diffuseur officiel HelloWork (accord commercial), soit
 *   2. Utiliser un flux que HelloWork t'aurait explicitement autorisé (RSS partenaire).
 * Le scraping du site n'est pas une option légale à mettre en place ici.
 *
 * Ce connecteur reste donc en mode "démonstration" tant qu'aucun accès officiel
 * n'est branché — mais il respecte déjà l'interface JobSource, donc le jour où
 * un vrai accès existe, il suffit de remplacer le contenu de search() sans
 * toucher au reste de l'application.
 */
export const HelloWorkSource: JobSource = {
  name: "hellowork",
  async search(_params: JobSourceParams): Promise<Job[]> {
    return [];
  },
};
