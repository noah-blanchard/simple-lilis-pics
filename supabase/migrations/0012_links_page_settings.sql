-- Editable visual settings for the public links page.

create table if not exists public.links_page_settings (
  id                smallint primary key default 1 check (id = 1),
  banner_image_path text,
  banner_focal_x    smallint not null default 50 check (banner_focal_x between 0 and 100),
  banner_focal_y    smallint not null default 50 check (banner_focal_y between 0 and 100),
  tagline_en        text,
  tagline_fr        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint links_page_tagline_en_length check (
    tagline_en is null or char_length(tagline_en) <= 160
  ),
  constraint links_page_tagline_fr_length check (
    tagline_fr is null or char_length(tagline_fr) <= 160
  ),
  constraint links_page_banner_path_length check (
    banner_image_path is null or char_length(banner_image_path) between 1 and 1024
  )
);

insert into public.links_page_settings (id)
values (1)
on conflict (id) do nothing;

create or replace function public.touch_links_page_settings_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists links_page_settings_touch_updated_at
  on public.links_page_settings;
create trigger links_page_settings_touch_updated_at
  before update on public.links_page_settings
  for each row execute function public.touch_links_page_settings_updated_at();

alter table public.links_page_settings enable row level security;

create policy "public read links page settings" on public.links_page_settings
  for select to anon using (id = 1);
create policy "auth all links page settings" on public.links_page_settings
  for all to authenticated using (id = 1) with check (id = 1);

drop function if exists public.save_links_editor(jsonb, jsonb);

create function public.save_links_editor(
  p_expected_items jsonb,
  p_items jsonb,
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
  mappings jsonb := '[]'::jsonb;
  expected_count integer;
  current_settings_updated_at timestamptz;
begin
  if jsonb_typeof(p_expected_items) <> 'array'
     or jsonb_typeof(p_items) <> 'array'
     or jsonb_typeof(p_settings) <> 'object' then
    raise exception 'Editor payloads have invalid shapes' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('links_editor'));
  perform 1 from public.links for update;
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

  if (select count(distinct (entry->>'client_id')) from jsonb_array_elements(p_items) entry)
       <> jsonb_array_length(p_items) then
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

    mappings := mappings || jsonb_build_array(jsonb_build_object(
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

  return mappings;
end;
$$;

revoke all on function public.save_links_editor(jsonb, jsonb, timestamptz, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_links_editor(jsonb, jsonb, timestamptz, jsonb)
  to service_role;
