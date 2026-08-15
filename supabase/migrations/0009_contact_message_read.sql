-- ─────────────────────────────────────────────────────────────
-- Migration 0009 — mark contact messages as read
-- Run in Supabase: SQL Editor → New query → paste → Run
--
-- Messages have been written since 0006 but never surfaced anywhere, so the
-- admin now has a Messages section. Reading an enquiry needs to be a state
-- that survives a refresh — otherwise the unread count on the dashboard is
-- meaningless — hence a nullable timestamp rather than a boolean: it answers
-- both "is it unread" and "when did I first open it".
-- ─────────────────────────────────────────────────────────────

alter table public.contact_messages
  add column if not exists read_at timestamptz;

-- Partial index: the unread badge only ever asks for the unread rows, and
-- they are the minority once the inbox has been worked through.
create index if not exists contact_messages_unread_idx
  on public.contact_messages (created_at desc)
  where read_at is null;

-- RLS is already enabled with an authenticated-read policy from 0006, and the
-- only writer stays the service_role client in the route handlers, so no
-- policy changes are needed here.
