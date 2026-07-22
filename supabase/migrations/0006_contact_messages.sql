-- ─────────────────────────────────────────────────────────────
-- Migration 0006 — contact form submissions (durable trace)
-- Run in Supabase: SQL Editor → New query → paste → Run
-- ─────────────────────────────────────────────────────────────

create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages (created_at desc);

-- ── Row Level Security ──
-- Unlike the site's public content tables, these rows are private visitor
-- submissions (name/email/message from strangers), so there is no public
-- read policy. Only authenticated users (admin) can read them; there is no
-- insert/update/delete policy at all — the only writer is the /api/contact
-- route handler, which uses the service_role client and bypasses RLS.
alter table public.contact_messages enable row level security;

create policy "auth read contact_messages" on public.contact_messages
  for select using (auth.role() = 'authenticated');
