-- Ordered, localized social icons for the public links page. Starts empty.

create table if not exists public.social_links (
  id          uuid primary key default gen_random_uuid(),
  label_en    text,
  label_fr    text,
  url         text not null,
  icon_key    text not null check (icon_key in (
                'instagram', 'tiktok', 'facebook', 'x', 'threads', 'bluesky',
                'youtube', 'vimeo', 'pinterest', 'linkedin', 'snapchat',
                'reddit', 'tumblr', 'mastodon', 'twitch', 'discord',
                'whatsapp', 'telegram', 'signal', 'wechat', 'line',
                'messenger', 'github', 'behance', 'dribbble', 'flickr',
                '500px', 'spotify', 'soundcloud', 'bandcamp', 'patreon',
                'ko-fi', 'substack', 'medium', 'website', 'email'
              )),
  position    integer not null default 0 check (position >= 0),
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint social_links_label_present check (
    nullif(btrim(label_en), '') is not null
    or nullif(btrim(label_fr), '') is not null
  ),
  constraint social_links_label_en_length check (
    label_en is null or char_length(label_en) <= 120
  ),
  constraint social_links_label_fr_length check (
    label_fr is null or char_length(label_fr) <= 120
  ),
  constraint social_links_url_length check (char_length(url) between 1 and 2048),
  constraint social_links_url_shape check (
    url ~ '^https://'
    or url ~ '^mailto:[^[:space:]]+@[^[:space:]]+$'
  )
);

create index if not exists social_links_public_order_idx
  on public.social_links (published, position, created_at, id);

create or replace function public.touch_social_link_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists social_links_touch_updated_at on public.social_links;
create trigger social_links_touch_updated_at
  before update on public.social_links
  for each row execute function public.touch_social_link_updated_at();

create table if not exists public.social_link_click_events (
  id             bigint generated always as identity primary key,
  social_link_id uuid not null references public.social_links(id) on delete cascade,
  clicked_at     timestamptz not null default now()
);

create index if not exists social_link_click_events_link_time_idx
  on public.social_link_click_events (social_link_id, clicked_at desc);
create index if not exists social_link_click_events_time_idx
  on public.social_link_click_events (clicked_at);

create table if not exists public.social_link_click_totals (
  social_link_id uuid primary key references public.social_links(id) on delete cascade,
  total          bigint not null default 0 check (total >= 0)
);

alter table public.social_links enable row level security;
alter table public.social_link_click_events enable row level security;
alter table public.social_link_click_totals enable row level security;

create policy "public read published social links" on public.social_links
  for select to anon using (published = true);
create policy "auth all social links" on public.social_links
  for all to authenticated using (true) with check (true);

create or replace function public.record_social_link_click(p_social_link_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform 1 from public.social_links
    where id = p_social_link_id and published = true
    for key share;
  if not found then
    return false;
  end if;

  insert into public.social_link_click_events (social_link_id)
    values (p_social_link_id);
  insert into public.social_link_click_totals (social_link_id, total)
    values (p_social_link_id, 1)
    on conflict (social_link_id) do update
      set total = public.social_link_click_totals.total + 1;
  return true;
end;
$$;

create or replace function public.get_social_link_click_stats()
returns table (
  social_link_id uuid,
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
    s.id,
    coalesce(t.total, 0)::bigint,
    count(e.id) filter (where e.clicked_at >= now() - interval '7 days')::bigint,
    count(e.id) filter (
      where e.clicked_at >= now() - interval '14 days'
        and e.clicked_at < now() - interval '7 days'
    )::bigint,
    max(e.clicked_at)
  from public.social_links s
  left join public.social_link_click_totals t on t.social_link_id = s.id
  left join public.social_link_click_events e on e.social_link_id = s.id
  group by s.id, t.total;
$$;

create or replace function public.prune_social_link_click_events()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  delete from public.social_link_click_events
    where clicked_at < now() - interval '13 months';
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

drop function if exists public.save_links_editor(
  jsonb, jsonb, timestamptz, jsonb
);

create function public.save_links_editor(
  p_expected_items jsonb,
  p_items jsonb,
  p_expected_social_items jsonb,
  p_social_items jsonb,
  p_expected_settings_updated_at timestamptz,
  p_settings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  saved_id uuid;
  link_mappings jsonb := '[]'::jsonb;
  social_mappings jsonb := '[]'::jsonb;
  expected_count integer;
  expected_social_count integer;
  current_settings_updated_at timestamptz;
begin
  if jsonb_typeof(p_expected_items) <> 'array'
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_typeof(p_expected_social_items) <> 'array'
     or jsonb_typeof(p_social_items) <> 'array'
     or jsonb_typeof(p_settings) <> 'object' then
    raise exception 'Editor payloads have invalid shapes' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('links_editor'));
  perform 1 from public.links for update;
  perform 1 from public.social_links for update;
  select updated_at into current_settings_updated_at
    from public.links_page_settings where id = 1 for update;

  if current_settings_updated_at is null
     or current_settings_updated_at <> p_expected_settings_updated_at then
    raise exception 'Links page settings changed since the editor was loaded'
      using errcode = '40001';
  end if;

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

  expected_social_count := jsonb_array_length(p_expected_social_items);
  if (select count(*) from public.social_links) <> expected_social_count
     or (select count(distinct (entry->>'id')) from jsonb_array_elements(p_expected_social_items) entry)
        <> expected_social_count
     or exists (
       select 1
       from public.social_links s
       left join jsonb_to_recordset(p_expected_social_items)
         as expected(id uuid, updated_at timestamptz)
         on expected.id = s.id
       where expected.id is null or expected.updated_at <> s.updated_at
     ) then
    raise exception 'Social links changed since the editor was loaded'
      using errcode = '40001';
  end if;

  if (select count(distinct (entry->>'client_id')) from jsonb_array_elements(p_items) entry)
       <> jsonb_array_length(p_items)
     or (select count(distinct (entry->>'client_id')) from jsonb_array_elements(p_social_items) entry)
       <> jsonb_array_length(p_social_items) then
    raise exception 'Duplicate client id' using errcode = '22023';
  end if;

  delete from public.links l
  where not exists (
    select 1 from jsonb_array_elements(p_items) entry
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
        url = item->>'url', icon_key = nullif(item->>'icon_key', ''),
        position = (item->>'position')::integer,
        published = (item->>'published')::boolean,
        open_behavior = item->>'open_behavior'
      where id = saved_id;
      if not found then
        raise exception 'Unknown link id' using errcode = '40001';
      end if;
    end if;
    link_mappings := link_mappings || jsonb_build_array(jsonb_build_object(
      'client_id', item->>'client_id', 'id', saved_id
    ));
  end loop;

  delete from public.social_links s
  where not exists (
    select 1 from jsonb_array_elements(p_social_items) entry
    where nullif(entry->>'id', '')::uuid = s.id
  );

  for item in select value from jsonb_array_elements(p_social_items)
  loop
    if nullif(item->>'id', '') is null then
      insert into public.social_links (
        label_en, label_fr, url, icon_key, position, published
      ) values (
        nullif(item->>'label_en', ''), nullif(item->>'label_fr', ''),
        item->>'url', item->>'icon_key', (item->>'position')::integer,
        (item->>'published')::boolean
      ) returning id into saved_id;
    else
      saved_id := (item->>'id')::uuid;
      update public.social_links set
        label_en = nullif(item->>'label_en', ''),
        label_fr = nullif(item->>'label_fr', ''),
        url = item->>'url', icon_key = item->>'icon_key',
        position = (item->>'position')::integer,
        published = (item->>'published')::boolean
      where id = saved_id;
      if not found then
        raise exception 'Unknown social link id' using errcode = '40001';
      end if;
    end if;
    social_mappings := social_mappings || jsonb_build_array(jsonb_build_object(
      'client_id', item->>'client_id', 'id', saved_id
    ));
  end loop;

  update public.links_page_settings set
    banner_image_path = nullif(p_settings->>'banner_image_path', ''),
    banner_focal_x = (p_settings->>'banner_focal_x')::smallint,
    banner_focal_y = (p_settings->>'banner_focal_y')::smallint,
    tagline_en = nullif(p_settings->>'tagline_en', ''),
    tagline_fr = nullif(p_settings->>'tagline_fr', '')
  where id = 1;

  return jsonb_build_object(
    'links', link_mappings,
    'socials', social_mappings
  );
end;
$$;

revoke all on function public.record_social_link_click(uuid)
  from public, anon, authenticated;
revoke all on function public.get_social_link_click_stats()
  from public, anon, authenticated;
revoke all on function public.prune_social_link_click_events()
  from public, anon, authenticated;
revoke all on function public.save_links_editor(
  jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) from public, anon, authenticated;

grant execute on function public.record_social_link_click(uuid) to service_role;
grant execute on function public.get_social_link_click_stats() to service_role;
grant execute on function public.prune_social_link_click_events() to service_role;
grant execute on function public.save_links_editor(
  jsonb, jsonb, jsonb, jsonb, timestamptz, jsonb
) to service_role;
