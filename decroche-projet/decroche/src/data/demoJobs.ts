import { Job } from "../types/job";

// Données de démo (mêmes que le prototype visuel). En production, ceci est
// remplacé par jobsService.fetchJobs() qui lit la vraie base + France Travail.
export const DEMO_JOBS: Job[] = [
  { id: "1", title: "Équipier polyvalent", company: "Café de la Place", city: "Saint-Germain-en-Laye", salary: "11,88 €/h", minAge: 16, category: "restauration", type: "Vacances", duration: "Juillet - Août", source: "demo", verified: false, createdAt: new Date().toISOString() },
  { id: "2", title: "Vendeur·se en boulangerie", company: "Boulangerie Faure", city: "Poissy", salary: "11,88 €/h", minAge: 16, category: "vente", type: "Week-end", duration: "Week-ends", source: "demo", verified: false, createdAt: new Date().toISOString() },
  { id: "3", title: "Animateur·rice centre de loisirs", company: "Mairie de Verneuil", city: "Verneuil-sur-Seine", salary: "60 €/jour", minAge: 17, category: "animation", type: "Saisonnier", duration: "Août", source: "demo", verified: false, createdAt: new Date().toISOString() },
  { id: "4", title: "Garde de chats à domicile", company: "Particulier", city: "Le Pecq", salary: "10 €/visite", minAge: 15, category: "animaux", type: "Ponctuel", duration: "Ponctuel", source: "demo", verified: false, createdAt: new Date().toISOString() },
  { id: "5", title: "Job d'été mairie", company: "Mairie de Poissy", city: "Poissy", salary: "SMIC horaire", minAge: 16, category: "collectivite", type: "Vacances", duration: "Juillet", source: "demo", verified: false, createdAt: new Date().toISOString() },
  { id: "6", title: "Baby-sitting soirée", company: "Particulier", city: "Saint-Germain-en-Laye", salary: "9 €/h", minAge: 16, category: "babysitting", type: "Ponctuel", duration: "Soirs", source: "demo", verified: false, createdAt: new Date().toISOString() },
];

export const CATEGORY_EMOJI: Record<string, string> = {
  restauration: "🍽️", vente: "🛍️", animation: "🎉", babysitting: "🍼",
  animaux: "🐾", agriculture: "🌾", distribution: "📬", evenementiel: "🎪",
  aide: "🤝", collectivite: "🏛️",
};
