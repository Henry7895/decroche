import { Job } from "../../types/job";
import { JobSource, JobSourceParams } from "./JobSource";

/**
 * Comme HelloWork, l'API Publisher officielle d'Indeed est aujourd'hui réservée
 * à un nombre restreint de partenaires validés par Indeed (candidature à faire
 * directement auprès d'eux). Pas d'accès self-service gratuit.
 * Connecteur en attente d'un accès officiel — voir HelloWorkSource.ts pour la logique.
 */
export const IndeedSource: JobSource = {
  name: "indeed",
  async search(_params: JobSourceParams): Promise<Job[]> {
    return [];
  },
};
