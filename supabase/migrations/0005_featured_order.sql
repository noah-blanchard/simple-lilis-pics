-- ─────────────────────────────────────────────────────────────
-- Migration 0005 — manual ordering for featured projects
-- Run in Supabase: SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────

alter table public.projects
  add column if not exists featured_order int;

create index if not exists projects_featured_order_idx
  on public.projects (featured_order)
  where featured = true;

-- Backfill: give currently-featured rows a starting order matching the
-- sort they'd already get (project_date desc, created_at desc), so the
-- reorder UI opens with a sane order instead of everything unordered.
with ranked as (
  select id, row_number() over (
    order by project_date desc nulls last, created_at desc
  ) - 1 as rn
  from public.projects
  where featured = true
)
update public.projects p
set featured_order = ranked.rn
from ranked
where p.id = ranked.id;
