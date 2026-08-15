-- ─────────────────────────────────────────────────────────────
-- Migration 0008 — street-portrait experience ratings
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- Two tables:
--   rating_tokens — one row per QR/NFC code Lili generates in the field.
--                   Single-use (burned via `used_at`) and short-lived (24h).
--   ratings       — the submitted rating itself, linked 1-1 to the token that
--                   authorized it.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.rating_tokens (
  id         uuid primary key default gen_random_uuid(),
  token      text unique not null,          -- short url-safe code shown in the QR
  locale     text not null default 'en' check (locale in ('en', 'fr')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  used_at    timestamptz                    -- non-null once a rating was submitted
);

create table if not exists public.ratings (
  -- `token_id` is unique, so a token can never yield two ratings even if the
  -- claim-then-insert below were ever retried. `on delete set null` keeps the
  -- rating (the content Lili cares about) if the token row is ever pruned.
  id         uuid primary key default gen_random_uuid(),
  token_id   uuid unique references public.rating_tokens(id) on delete set null,
  stars      smallint not null check (stars between 1 and 5),
  note       text,                          -- optional written review
  name       text,                          -- optional; null = anonymous
  locale     text not null default 'en' check (locale in ('en', 'fr')),
  approved   boolean not null default false,-- gate for the public testimonials
  created_at timestamptz not null default now()
);

create index if not exists rating_tokens_token_idx
  on public.rating_tokens (token);

create index if not exists ratings_created_at_idx
  on public.ratings (created_at desc);

create index if not exists ratings_approved_idx
  on public.ratings (approved) where approved;

-- ── Row Level Security ──
-- Tokens are pure infrastructure: nothing public ever reads or writes them.
-- The only writer is /api/ratings (service_role, bypasses RLS); the only
-- reader besides that is the admin.
alter table public.rating_tokens enable row level security;

create policy "auth all rating_tokens" on public.rating_tokens
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Ratings are visitor submissions, so — like contact_messages — there is no
-- public insert policy; the /api/ratings route handler writes with the
-- service_role key. Unlike contact_messages, APPROVED rows are meant to be
-- public (they feed the site's testimonials), and that read happens through
-- the anon server client, so it needs a policy scoped to `approved`.
alter table public.ratings enable row level security;

create policy "public read approved ratings" on public.ratings
  for select using (approved = true);

create policy "auth all ratings" on public.ratings
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
