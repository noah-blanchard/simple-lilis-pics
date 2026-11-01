# 99: Self-hosting Supabase on Dokploy (assessment, NOT scheduled)

> **Do not execute.** This is a decision aid for the operator. It is not an
> agent task. If the operator decides to go ahead, a dedicated multi-phase plan
> will be written from this outline.

## Recommendation

**Keep Supabase Cloud during and after the monorepo/Dokploy migration.**
Reconsider later, as its own project, if one of the triggers below applies.

Why not now:

- **One change at a time.** The monorepo + Dokploy migration already changes
  build, runtime, routing and DNS. Keeping the database where it is makes the
  cutover a pure DNS switch with a trivial rollback (phase 07).
- **Operational weight.** The apps are stateless containers. Self-hosted
  Supabase is a stateful, roughly 10-service stack that you would own:
  Postgres, GoTrue (Auth), PostgREST, Storage API, imgproxy, Kong (gateway),
  Realtime, Studio, postgres-meta, Edge Runtime, Supavisor (pooler) and the
  analytics/Vector pipeline. Dokploy has a Supabase template that starts it
  all, but running it well (backups, upgrades, security) is ongoing work.
- **This app's needs are small.** It uses Auth (email/password, one admin
  user), PostgREST through `supabase-js` (tables, RPCs, RLS, triggers), and one
  public Storage bucket (`photos`). It doesn't use Realtime or Edge Functions.
  The Cloud free/pro tiers cover this easily.

## Triggers that would justify self-hosting

- Cost: the project needs a paid tier only to avoid the free-tier inactivity
  pause, or for storage/egress limits, and the Dokploy server has spare
  capacity.
- Data residency or ownership requirements.
- Wanting everything on one bill and one box, after the Dokploy setup has run
  stably for a while.

## What you would take on

| Area | Responsibility |
| --- | --- |
| Backups | Scheduled `pg_dump` (or WAL archiving) **off-server**, plus backups of the Storage volume (all of Lili's photos). Restore drills. |
| Upgrades | Supabase image versions across ~10 services, Postgres major upgrades. |
| Security | Rotating JWT secret/keys, locking down Studio (never public without auth), Kong exposure, Postgres not exposed publicly, OS patching. |
| Email | SMTP configuration for Auth emails (invites, resets). Cloud provides a default sender; self-hosted does not. |
| Capacity | RAM (plan for 2–4 GB just for Supabase), disk growth from photos, and image transformations (imgproxy). |
| Monitoring | Health of every service, disk usage, Postgres. |

## Migration outline (for a future plan)

1. **Stand up** Supabase on Dokploy at e.g. `supabase.lilispics.com` (API
   gateway only; Studio behind auth or VPN). Generate a new JWT secret and the
   derived `anon`/`service_role` keys. Configure SMTP.
2. **Schema:** apply `supabase/migrations/0001…` in order (they are written
   for the SQL editor). Diff against Cloud with `pg_dump --schema-only` and
   reconcile drift. Migrations are applied manually today, so drift is
   possible.
3. **Rehearsal (no freeze):** copy data and Storage into the new instance,
   point a staging deployment (phase 07 staging apps) at it, and run the full
   smoke test.
4. **Data cutover (short write freeze, Lili informed):**
   - `public` schema data: `pg_dump --data-only` → restore.
   - Auth: dump `auth.users` and `auth.identities` (password hashes are
     portable between GoTrue instances). Verify Lili can log in.
   - Storage: copy every object in the `photos` bucket (S3-compatible API or a
     script using `supabase-js` list → download → upload), then verify that
     `storage.objects` rows match.
   - Check that the DB stores **relative** storage keys, not absolute Cloud
     URLs. `resolveImageUrl` (`@lili/core/types/db`) builds public URLs from
     `NEXT_PUBLIC_SUPABASE_URL`, so relative keys move transparently. Query
     for absolute URLs: `image_path like 'http%supabase%'` on photo and
     banner columns. Rewrite any you find.
5. **Switch apps:** update `NEXT_PUBLIC_SUPABASE_URL`/`ANON_KEY` (build args
   **and** runtime) and `SUPABASE_SERVICE_ROLE_KEY` (runtime) in all three
   Dokploy apps, then rebuild. `next.config.ts` derives the image host from
   the URL automatically.
6. **Rollback:** point env vars back to Cloud and rebuild. Writes made during
   the self-hosted window would need to be copied back. Keep the window short
   and the Cloud project untouched until the self-hosted instance is stable.

## Decision checklist (fill in when revisiting)

- [ ] Current Supabase plan and monthly cost:
- [ ] Dokploy server spare RAM / disk:
- [ ] Off-server backup target chosen (S3/B2/…):
- [ ] SMTP provider for Auth emails:
- [ ] Who handles upgrades and how often:
- [ ] Go / no-go:
