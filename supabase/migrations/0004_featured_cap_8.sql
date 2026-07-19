-- ─────────────────────────────────────────────────────────────
-- Migration 0004 — bump featured cap 6 → 8
-- Run in Supabase: SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────

-- ── Max-8-featured trigger (DB-level guard) ───────────────────
-- Primary enforcement is server-side (409 FEATURED_LIMIT in the API).
-- This trigger catches direct DB writes that bypass the API.
-- Replaces the body of the existing enforce_featured_cap() function
-- (created in 0003_projects.sql); the projects_featured_cap trigger
-- already points at this function by name, so no trigger DDL is needed.
create or replace function public.enforce_featured_cap()
  returns trigger language plpgsql as $$
begin
  if new.featured and (
    select count(*)
    from public.projects
    where featured = true
      and id <> new.id
  ) >= 8 then
    raise exception 'FEATURED_LIMIT: max 8 featured projects';
  end if;
  return new;
end;
$$;
