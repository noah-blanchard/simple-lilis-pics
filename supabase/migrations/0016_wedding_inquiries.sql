-- 0016 · Reply cards from wedding.lilispics.com.
-- Private visitor submissions, like contact_messages: no public read, no
-- insert/update/delete policy. The only writer is POST /api/inquiry on the
-- wedding app through the service_role client (bypasses RLS).
-- See docs/plans/wedding/02-design-decisions.md (D12).

create table if not exists public.wedding_inquiries (
  id           uuid primary key default gen_random_uuid(),
  names        text not null check (char_length(names) between 1 and 200),
  email        text not null check (char_length(email) <= 320),
  wedding_date date,
  date_unset   boolean not null default false,
  venue        text not null check (char_length(venue) between 1 and 200),
  guests       text check (guests in ('under_20', '20_60', '60_120', 'over_120')),
  collection   text check (collection in ('elopement', 'intimate', 'full_day', 'unsure')),
  budget       text check (budget in ('under_3000', '3000_4500', '4500_6000', 'over_6000', 'unsure')),
  heard_from   text not null default '' check (char_length(heard_from) <= 200),
  message      text not null default '' check (char_length(message) <= 5000),
  locale       text not null default 'en' check (locale in ('en', 'fr')),
  consent_at   timestamptz not null,
  created_at   timestamptz not null default now(),
  read_at      timestamptz,
  constraint wedding_inquiries_date_or_unset check (wedding_date is not null or date_unset)
);

create index if not exists wedding_inquiries_created_at_idx
  on public.wedding_inquiries (created_at desc);
create index if not exists wedding_inquiries_unread_idx
  on public.wedding_inquiries (created_at desc) where read_at is null;

alter table public.wedding_inquiries enable row level security;

drop policy if exists "auth read wedding_inquiries" on public.wedding_inquiries;
create policy "auth read wedding_inquiries" on public.wedding_inquiries
  for select using (auth.role() = 'authenticated');
