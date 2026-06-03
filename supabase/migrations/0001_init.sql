-- ─────────────────────────────────────────────────────────────
-- Migration 0001 — schéma initial du portfolio (photos + tags)
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- ─────────────────────────────────────────────────────────────

-- Tags (taxonomie éditable, seedée depuis les spécialités du site)
create table if not exists public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,        -- "landscape", "portrait", ...
  label_fr   text not null,
  label_en   text not null,
  created_at timestamptz not null default now()
);

-- Photos
create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  title_fr    text not null,
  title_en    text not null,
  shoot_date  date not null,              -- date réelle, affichée en année
  image_path  text not null,              -- clé objet du bucket "photos" (ou URL unsplash legacy)
  featured    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Jointure N-N photos <-> tags
create table if not exists public.photo_tags (
  photo_id uuid not null references public.photos(id) on delete cascade,
  tag_id   uuid not null references public.tags(id)   on delete cascade,
  primary key (photo_id, tag_id)
);

create index if not exists photos_shoot_date_idx on public.photos (shoot_date desc);
create index if not exists photos_featured_idx   on public.photos (featured) where featured = true;

-- ── Row Level Security : lecture publique, écriture authentifiée uniquement ──
alter table public.photos     enable row level security;
alter table public.tags       enable row level security;
alter table public.photo_tags enable row level security;

-- Lecture publique (site vitrine)
create policy "public read photos"     on public.photos     for select using (true);
create policy "public read tags"       on public.tags       for select using (true);
create policy "public read photo_tags" on public.photo_tags for select using (true);

-- Écriture réservée aux utilisateurs authentifiés (la cliente connectée).
-- NB : les route handlers /api utilisent la service_role qui bypass la RLS ;
-- ces policies protègent les accès directs via la clé anon (navigateur).
create policy "auth write photos"     on public.photos     for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write tags"       on public.tags       for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "auth write photo_tags" on public.photo_tags for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
