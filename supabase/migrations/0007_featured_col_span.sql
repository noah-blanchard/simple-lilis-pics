-- ─────────────────────────────────────────────────────────────
-- Migration 0007 — per-tile size for the featured bento layout
-- Run in Supabase: SQL Editor → New query → paste → Run
-- (Safe to re-run — idempotent, and fixes the range if an earlier
--  1..4 version of this migration was already applied.)
-- ─────────────────────────────────────────────────────────────

-- Column span each featured tile occupies in the home-page bento grid, in the
-- grid's BASE columns (double resolution, 1..8). Row span is derived from the
-- cover photo's orientation, so this single value fully describes the tile size
-- while keeping aspect ratio. Default 2 = the "S" size.
alter table public.projects
  add column if not exists featured_col_span int not null default 2;

alter table public.projects
  alter column featured_col_span set default 2;

alter table public.projects
  drop constraint if exists projects_featured_col_span_check;

alter table public.projects
  add constraint projects_featured_col_span_check
    check (featured_col_span between 1 and 8);
