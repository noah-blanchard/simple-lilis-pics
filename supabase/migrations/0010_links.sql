-- Public, localized link page managed as one visual editor snapshot.

create table if not exists public.links (
  id             uuid primary key default gen_random_uuid(),
  name_en        text,
  name_fr        text,
  subtitle_en    text,
  subtitle_fr    text,
  url            text not null,
  icon_key       text check (icon_key is null or icon_key in (
                   'website', 'instagram', 'tiktok', 'douyin',
                   'email', 'portfolio', 'calendar'
                 )),
  position       integer not null default 0 check (position >= 0),
  published      boolean not null default false,
  open_behavior  text not null default 'new_tab'
                   check (open_behavior in ('same_tab', 'new_tab')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint links_name_present check (
    nullif(btrim(name_en), '') is not null
    or nullif(btrim(name_fr), '') is not null
  ),
  constraint links_name_en_length check (name_en is null or char_length(name_en) <= 120),
  constraint links_name_fr_length check (name_fr is null or char_length(name_fr) <= 120),
  constraint links_subtitle_en_length check (subtitle_en is null or char_length(subtitle_en) <= 240),
  constraint links_subtitle_fr_length check (subtitle_fr is null or char_length(subtitle_fr) <= 240),
  constraint links_url_length check (char_length(url) between 1 and 2048),
  constraint links_url_shape check (
    url ~ '^https://'
    or url ~ '^mailto:[^[:space:]]+@[^[:space:]]+$'
    or (url ~ '^/' and url !~ '^//')
  )
);

create index if not exists links_public_order_idx
  on public.links (published, position, created_at, id);

create or replace function public.touch_link_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists links_touch_updated_at on public.links;
create trigger links_touch_updated_at
  before update on public.links
  for each row execute function public.touch_link_updated_at();

create table if not exists public.link_click_events (
  id         bigint generated always as identity primary key,
  link_id    uuid not null references public.links(id) on delete cascade,
  clicked_at timestamptz not null default now()
);

create index if not exists link_click_events_link_time_idx
  on public.link_click_events (link_id, clicked_at desc);
create index if not exists link_click_events_time_idx
  on public.link_click_events (clicked_at);

create table if not exists public.link_click_totals (
  link_id uuid primary key references public.links(id) on delete cascade,
  total   bigint not null default 0 check (total >= 0)
);

alter table public.links enable row level security;
alter table public.link_click_events enable row level security;
alter table public.link_click_totals enable row level security;

create policy "public read published links" on public.links
  for select to anon using (published = true);
create policy "auth all links" on public.links
  for all to authenticated using (true) with check (true);

create or replace function public.record_link_click(p_link_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.links
    where id = p_link_id and published = true
    for key share;
  if not found then
    return false;
  end if;

  insert into public.link_click_events (link_id) values (p_link_id);
  insert into public.link_click_totals (link_id, total)
    values (p_link_id, 1)
    on conflict (link_id) do update
      set total = public.link_click_totals.total + 1;
  return true;
end;
$$;

create or replace function public.get_link_click_stats()
returns table (
  link_id uuid,
  total bigint,
  current_period bigint,
  previous_period bigint,
  last_clicked_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    l.id,
    coalesce(t.total, 0)::bigint,
    count(e.id) filter (where e.clicked_at >= now() - interval '7 days')::bigint,
    count(e.id) filter (
      where e.clicked_at >= now() - interval '14 days'
        and e.clicked_at < now() - interval '7 days'
    )::bigint,
    max(e.clicked_at)
  from public.links l
  left join public.link_click_totals t on t.link_id = l.id
  left join public.link_click_events e on e.link_id = l.id
  group by l.id, t.total;
$$;

create or replace function public.prune_link_click_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  delete from public.link_click_events
    where clicked_at < now() - interval '13 months';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

create or replace function public.save_links_editor(
  p_expected_items jsonb,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  saved_id uuid;
  mappings jsonb := '[]'::jsonb;
  expected_count integer;
begin
  if jsonb_typeof(p_expected_items) <> 'array'
     or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Editor payloads must be arrays' using errcode = '22023';
  end if;

  perform 1 from public.links for update;
  expected_count := jsonb_array_length(p_expected_items);

  if (select count(*) from public.links) <> expected_count
     or (select count(distinct (entry->>'id')) from jsonb_array_elements(p_expected_items) entry)
        <> expected_count
     or exists (
       select 1
       from public.links l
       left join jsonb_to_recordset(p_expected_items)
         as expected(id uuid, updated_at timestamptz)
         on expected.id = l.id
       where expected.id is null or expected.updated_at <> l.updated_at
     ) then
    raise exception 'Links changed since the editor was loaded' using errcode = '40001';
  end if;

  if (select count(distinct (entry->>'client_id')) from jsonb_array_elements(p_items) entry)
       <> jsonb_array_length(p_items) then
    raise exception 'Duplicate client id' using errcode = '22023';
  end if;

  delete from public.links l
  where not exists (
    select 1
    from jsonb_array_elements(p_items) entry
    where nullif(entry->>'id', '')::uuid = l.id
  );

  for item in select value from jsonb_array_elements(p_items)
  loop
    if nullif(item->>'id', '') is null then
      insert into public.links (
        name_en, name_fr, subtitle_en, subtitle_fr, url,
        icon_key, position, published, open_behavior
      ) values (
        nullif(item->>'name_en', ''), nullif(item->>'name_fr', ''),
        nullif(item->>'subtitle_en', ''), nullif(item->>'subtitle_fr', ''),
        item->>'url', nullif(item->>'icon_key', ''),
        (item->>'position')::integer, (item->>'published')::boolean,
        item->>'open_behavior'
      ) returning id into saved_id;
    else
      saved_id := (item->>'id')::uuid;
      update public.links set
        name_en = nullif(item->>'name_en', ''),
        name_fr = nullif(item->>'name_fr', ''),
        subtitle_en = nullif(item->>'subtitle_en', ''),
        subtitle_fr = nullif(item->>'subtitle_fr', ''),
        url = item->>'url',
        icon_key = nullif(item->>'icon_key', ''),
        position = (item->>'position')::integer,
        published = (item->>'published')::boolean,
        open_behavior = item->>'open_behavior'
      where id = saved_id;
      if not found then
        raise exception 'Unknown link id' using errcode = '40001';
      end if;
    end if;

    mappings := mappings || jsonb_build_array(jsonb_build_object(
      'client_id', item->>'client_id',
      'id', saved_id
    ));
  end loop;

  return mappings;
end;
$$;

revoke all on function public.record_link_click(uuid) from public, anon, authenticated;
revoke all on function public.get_link_click_stats() from public, anon, authenticated;
revoke all on function public.prune_link_click_events() from public, anon, authenticated;
revoke all on function public.save_links_editor(jsonb, jsonb) from public, anon, authenticated;

grant execute on function public.record_link_click(uuid) to service_role;
grant execute on function public.get_link_click_stats() to service_role;
grant execute on function public.prune_link_click_events() to service_role;
grant execute on function public.save_links_editor(jsonb, jsonb) to service_role;
