-- Données de démarrage RÉELLES pour la table "jobs" (pas des données en
-- mémoire côté frontend). À exécuter dans l'éditeur SQL Supabase après
-- schema.sql. Marquées verified = true pour apparaître immédiatement.
insert into jobs (titre, entreprise, ville, age_min, salaire, type, categorie, date_debut, source, verified) values
('Équipier polyvalent', 'Café de la Place', 'Saint-Germain-en-Laye', 16, '11,88 €/h', 'Vacances', 'restauration', '2026-07-01', 'demo', true),
('Vendeur·se en boulangerie', 'Boulangerie Faure', 'Poissy', 16, '11,88 €/h', 'Week-end', 'vente', '2026-07-01', 'demo', true),
('Animateur·rice centre de loisirs', 'Mairie de Verneuil', 'Verneuil-sur-Seine', 17, '60 €/jour', 'Saisonnier', 'animation', '2026-08-01', 'demo', true),
('Garde de chats à domicile', 'Particulier', 'Le Pecq', 15, '10 €/visite', 'Ponctuel', 'animaux', null, 'demo', true),
('Job d''été mairie', 'Mairie de Poissy', 'Poissy', 16, 'SMIC horaire', 'Vacances', 'collectivite', '2026-07-01', 'demo', true),
('Baby-sitting soirée', 'Particulier', 'Saint-Germain-en-Laye', 16, '9 €/h', 'Ponctuel', 'babysitting', null, 'demo', true);
