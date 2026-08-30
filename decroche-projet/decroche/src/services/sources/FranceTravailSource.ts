import { Job } from "../../types/job";
import { JobSource, JobSourceParams } from "./JobSource";

/**
 * France Travail propose une vraie API publique en self-service : "Offres d'emploi v2".
 * Contrairement à HelloWork/Indeed, tu peux l'activer toi-même gratuitement :
 *   1. Crée un compte sur https://francetravail.io
 *   2. Crée une "application", active le produit "Offres d'emploi v2"
 *   3. Récupère client_id / client_secret et mets-les dans .env.local
 *
 * L'authentification suit le flux OAuth2 "client credentials" (machine-to-machine).
 * ⚠️ Les URLs exactes du endpoint token et du endpoint de recherche sont données
 * précisément dans TA console francetravail.io au moment de l'activation
 * (elles ont changé avec le passage Pôle emploi → France Travail, donc copie-les
 * depuis ton tableau de bord plutôt que de faire confiance à une URL codée en dur
 * ici). Remplace les deux constantes ci-dessous par les valeurs de ta console.
 */
const TOKEN_URL = "https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire"; // à vérifier dans ta console
const SEARCH_URL = "https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search"; // à vérifier dans ta console

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const clientId = import.meta.env.VITE_FRANCETRAVAIL_CLIENT_ID as string;
  const clientSecret = import.meta.env.VITE_FRANCETRAVAIL_CLIENT_SECRET as string;
  if (!clientId || !clientSecret) {
    throw new Error("Clés France Travail manquantes — voir .env.example et docs/SETUP.md");
  }

  // ⚠️ Ce flux OAuth2 utilise le client_secret. Il ne doit JAMAIS être appelé
  // depuis le navigateur en production (le secret serait visible dans le réseau).
  // En vrai déploiement, ce fetch doit passer par une fonction serveur
  // (ex. Supabase Edge Function) qui garde le secret côté serveur, et le
  // frontend appelle ta fonction plutôt que France Travail directement.
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: "api_offresdemploiv2 o2dsoffre",
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Auth France Travail échouée (${res.status})`);
  const data = await res.json();

  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

function mapToJob(offre: any): Job {
  return {
    id: `francetravail-${offre.id}`,
    title: offre.intitule,
    company: offre.entreprise?.nom ?? "Entreprise non précisée",
    city: offre.lieuTravail?.libelle ?? "",
    salary: offre.salaire?.libelle,
    category: offre.secteurActiviteLibelle ?? "Autre",
    type: offre.typeContratLibelle ?? "Non précisé",
    description: offre.description,
    source: "francetravail",
    sourceUrl: offre.origineOffre?.urlOrigine,
    verified: true,
    createdAt: offre.dateCreation,
  };
}

export const FranceTravailSource: JobSource = {
  name: "francetravail",
  async search(params: JobSourceParams): Promise<Job[]> {
    const token = await getAccessToken();
    const query = new URLSearchParams();
    if (params.motCle) query.set("motsCles", params.motCle);
    if (params.ville) query.set("commune", params.ville);
    if (params.rayonKm) query.set("distance", String(params.rayonKm));

    const res = await fetch(`${SEARCH_URL}?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Recherche France Travail échouée (${res.status})`);
    const data = await res.json();
    return (data.resultats ?? []).map(mapToJob);
  },
};
