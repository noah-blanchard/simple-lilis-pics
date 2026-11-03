-- 0015 · Wedding stories reuse portfolio projects.
-- A project becomes a story on wedding.lilispics.com when wedding_story is true.
-- Idempotent: safe to re-run. Public read is inherited from "public read projects".
-- See docs/plans/wedding/02-design-decisions.md (D11).

alter table public.projects
  add column if not exists wedding_story    boolean not null default false,
  add column if not exists wedding_slug     text,
  add column if not exists wedding_couple   text,
  add column if not exists wedding_venue    text,
  add column if not exists wedding_type     text,
  add column if not exists wedding_quote_en text,
  add column if not exists wedding_quote_fr text;

alter table public.projects drop constraint if exists projects_wedding_type_check;
alter table public.projects add constraint projects_wedding_type_check
  check (wedding_type is null or wedding_type in ('elopement', 'intimate', 'full_day'));

alter table public.projects drop constraint if exists projects_wedding_slug_format;
alter table public.projects add constraint projects_wedding_slug_format
  check (wedding_slug is null or wedding_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- A published story needs an address, names and a type.
alter table public.projects drop constraint if exists projects_wedding_story_complete;
alter table public.projects add constraint projects_wedding_story_complete
  check (not wedding_story or (wedding_slug is not null and wedding_couple is not null and wedding_type is not null));

create unique index if not exists projects_wedding_slug_key
  on public.projects (wedding_slug) where wedding_slug is not null;

create index if not exists projects_wedding_story_idx
  on public.projects (project_date desc nulls last) where wedding_story;
