-- ─────────────────────────────────────────────────────────────
-- Migration 0002 — bucket Storage "photos" + policies
-- À exécuter dans Supabase : SQL Editor → New query → coller → Run
-- (Alternative : créer le bucket via Storage UI, puis ne lancer que les policies)
-- ─────────────────────────────────────────────────────────────

-- Bucket public "photos" (lecture publique via URL ; écriture protégée par policies)
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

-- Lecture publique des objets du bucket "photos"
create policy "public read photos bucket"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Upload réservé aux utilisateurs authentifiés
create policy "auth upload photos bucket"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

-- Mise à jour (remplacement) réservée aux authentifiés
create policy "auth update photos bucket"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos') with check (bucket_id = 'photos');

-- Suppression réservée aux authentifiés
create policy "auth delete photos bucket"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos');
