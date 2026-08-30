// Format normalisé commun à toutes les sources (démo ou réelles).
export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  latitude?: number;
  longitude?: number;
  salary?: string;
  minAge?: number;
  maxAge?: number;
  category: string;
  type: string; // "Vacances" | "Week-end" | "Ponctuel" | "Saisonnier" | "Stage" | "Temps partiel"
  duration?: string;
  description?: string;
  source: "demo" | "hellowork" | "indeed" | "francetravail" | "collectivite" | "association";
  sourceUrl?: string;
  verified: boolean;
  createdAt: string;
}
