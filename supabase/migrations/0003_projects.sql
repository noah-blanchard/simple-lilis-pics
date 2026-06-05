-- ─────────────────────────────────────────────────────────────
-- Migration 0003 — project-centric model (clean slate; keeps tags)
-- Run in Supabase: SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────

-- Drop old photo model (cascade removes photo_tags too)
drop table if exists public.photo_tags cascade;
drop table if exists public.photos     cascade;

-- ── Projects ──────────────────────────────────────────────────
-- All metadata is optional (nullable). cover_photo_id added after
-- project_photos exists to avoid a circular FK at create time.
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  title_fr        text,
  title_en        text,
  description_fr  text,
  description_en  text,
  project_date    date,                        -- optional; year derived for display
  featured        boolean not null default false,
  cover_photo_id  uuid,                        -- FK added below
  created_at      timestamptz not null default now()
);

-- ── Project photos (1–4 per project) ──────────────────────────
create table if not exists public.project_photos (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  image_path   text not null,                  -- bucket object key (reuses "photos" bucket)
  orientation  text not null default 'landscape'
                 check (orientation in ('landscape', 'portrait')),
  position     int  not null default 0,        -- ordering 0..3 within the project
  created_at   timestamptz not null default now()
);

-- Now safe to add the cover FK (ON DELETE SET NULL so deleting a photo
-- doesn't cascade-delete the whole project).
alter table public.projects
  add constraint projects_cover_photo_fk
  foreign key (cover_photo_id)
  references public.project_photos(id)
  on delete set null;

-- ── Project ↔ tags (N-N) ─────────────────────────────────────
create table if not exists public.project_tags (
  project_id uuid not null references public.projects(id) on delete cascade,
  tag_id     uuid not null references public.tags(id)     on delete cascade,
  primary key (project_id, tag_id)
);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists project_photos_project_idx
  on public.project_photos (project_id, position);

create index if not exists projects_date_idx
  on public.projects (project_date desc nulls last);

create index if not exists projects_featured_idx
  on public.projects (featured) where featured = true;

-- ── Row Level Security ────────────────────────────────────────
alter table public.projects       enable row level security;
alter table public.project_photos enable row level security;
alter table public.project_tags   enable row level security;

-- Public read (portfolio site)
create policy "public read projects"
  on public.projects       for select using (true);
create policy "public read project_photos"
  on public.project_photos for select using (true);
create policy "public read project_tags"
  on public.project_tags   for select using (true);

-- Authenticated write (admin only via service_role in route handlers;
-- these policies guard direct anon-key access).
create policy "auth write projects"
  on public.projects       for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth write project_photos"
  on public.project_photos for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "auth write project_tags"
  on public.project_tags   for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ── Max-6-featured trigger (DB-level guard) ───────────────────
-- Primary enforcement is server-side (409 FEATURED_LIMIT in the API).
-- This trigger catches direct DB writes that bypass the API.
create or replace function public.enforce_featured_cap()
  returns trigger language plpgsql as $$
begin
  if new.featured and (
    select count(*)
    from public.projects
    where featured = true
      and id <> new.id
  ) >= 6 then
    raise exception 'FEATURED_LIMIT: max 6 featured projects';
  end if;
  return new;
end;
$$;

create trigger projects_featured_cap
  before insert or update of featured
  on public.projects
  for each row
  execute function public.enforce_featured_cap();
