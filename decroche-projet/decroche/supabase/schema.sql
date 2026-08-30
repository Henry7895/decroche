-- Schéma Décroche — à exécuter dans l'éditeur SQL de ton projet Supabase.
-- Row Level Security (RLS) activé partout : chaque utilisateur ne voit et ne
-- modifie que SES propres données. C'est particulièrement important ici car
-- les utilisateurs sont mineurs.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null,
  date_naissance date not null,
  ville text,
  preferences jsonb default '{}',
  disponibilites jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  entreprise text not null,
  description text,
  ville text not null,
  age_min int not null default 14,
  age_max int,
  salaire text,
  type text,
  categorie text,
  date_debut date,
  date_fin date,
  source text not null default 'demo',
  source_url text,
  image text,
  verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text not null,
  job_source text not null default 'db',
  created_at timestamptz default now(),
  unique (user_id, job_id)
);

create table if not exists saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text not null,
  job_source text not null default 'db',
  created_at timestamptz default now(),
  unique (user_id, job_id)
);

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text not null,
  status text not null default 'a_faire',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, job_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  job_id text not null,
  reason text not null,
  created_at timestamptz default now()
);

-- Rôle admin simple : un booléen sur le profil (à activer manuellement en base
-- pour les comptes de confiance — ne jamais l'exposer comme réglable par l'utilisateur).
alter table profiles add column if not exists is_admin boolean default false;

-- === RLS ===
alter table profiles enable row level security;
alter table jobs enable row level security;
alter table likes enable row level security;
alter table saves enable row level security;
alter table applications enable row level security;
alter table reports enable row level security;

create policy "Chacun voit/modifie son propre profil" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Tout le monde peut lire les offres vérifiées" on jobs
  for select using (verified = true or exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Seuls les admins gèrent les offres" on jobs
  for insert with check (exists (select 1 from profiles where id = auth.uid() and is_admin));
create policy "Seuls les admins modifient les offres" on jobs
  for update using (exists (select 1 from profiles where id = auth.uid() and is_admin));
create policy "Seuls les admins suppriment les offres" on jobs
  for delete using (exists (select 1 from profiles where id = auth.uid() and is_admin));

create policy "Chacun gère ses propres likes" on likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Chacun gère ses propres sauvegardes" on saves for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Chacun gère ses propres candidatures" on applications for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Chacun peut signaler" on reports for insert with check (auth.uid() = user_id);
create policy "Seuls les admins lisent les signalements" on reports for select using (exists (select 1 from profiles where id = auth.uid() and is_admin));
