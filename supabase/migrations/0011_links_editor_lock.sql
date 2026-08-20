-- Serialize WYSIWYG saves even while the links table is empty. A row lock in
-- the original function cannot lock a row that does not exist, so two first
-- saves could otherwise both pass the snapshot check.

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

  perform pg_advisory_xact_lock(hashtext('links_editor'));
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

revoke all on function public.save_links_editor(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.save_links_editor(jsonb, jsonb) to service_role;
