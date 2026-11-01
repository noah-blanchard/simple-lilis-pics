# Local development

## Prerequisites

- Bun installed and available in PowerShell.
- A Supabase project you are allowed to configure.
- Access to the Supabase SQL Editor and Auth dashboard.
- Optional OpenRouter and Resend accounts for translation and notification email.

The installed dependency versions are authoritative. Do not upgrade them as part of setup.

## Install

From the repository root:

```powershell
bun install
Copy-Item apps\web\.env.example apps\web\.env.local
Copy-Item apps\admin\.env.example apps\admin\.env.local
Copy-Item apps\wedding\.env.example apps\wedding\.env.local
```

Each app has its own `.env.local` (`apps/web/.env.local`, `apps/admin/.env.local` and `apps/wedding/.env.local`), because Next.js loads env files from the app directory, not the repo root. Do not commit `.env.local`.

## Environment variables

| Variable | Used by | Exposure | Required | Purpose |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | web, admin | Browser and server | Yes | Supabase project URL and Storage hostname |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | web, admin | Browser and server | Yes | Public client key protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | web, admin | Server only | Yes | Admin writes and uploads (admin); contact, rating and click inserts (web); seed (web) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | web, admin | Browser and server | No | Storage bucket; defaults to `photos` |
| `NEXT_PUBLIC_SITE_URL` | web, admin, wedding | Browser and server | Production | Each app's own canonical origin (web: Open Graph and sitemap) |
| `PORTFOLIO_URL` | admin | Server only | Yes | Portfolio origin: QR rating links point here, and the admin calls its `/api/revalidate` |
| `REVALIDATE_SECRET` | web, admin | Server only | Yes | Shared secret for the cache-revalidation webhook; must be identical in both apps |
| `ADMIN_URL` | web | Build time | No | Admin origin that old `/admin` and `/login` URLs redirect to; defaults to `http://localhost:3051` |
| `OPENROUTER_API_KEY` | admin | Server only | Translation only | Admin EN/FR translation |
| `OPENROUTER_MODEL` | admin | Server only | No | Translation model override |
| `RESEND_API_KEY` | web | Server only | Email only | Contact notification delivery |
| `CONTACT_TO_EMAIL` | web | Server only | Email only | Notification recipient |
| `CONTACT_FROM_EMAIL` | web | Server only | Email only | Verified Resend sender |

Generate `REVALIDATE_SECRET` once and paste the same value into both files:

```powershell
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The application throws during import when the two public Supabase variables are absent. Routes using the admin client also require the service-role key.

For local canonical metadata, set `NEXT_PUBLIC_SITE_URL=http://localhost:3050` in the web app, `http://localhost:3051` in the admin app and `http://localhost:3052` in the wedding app. The web code fallback is `http://localhost:3000`, while the development scripts intentionally run ports 3050 (web), 3051 (admin) and 3052 (wedding). The wedding scaffold only needs `NEXT_PUBLIC_SITE_URL`; its Supabase variables are not used yet.

## Create the database

Apply every file in `supabase/migrations/` in numeric order:

1. `0001_init.sql`
2. `0002_storage.sql`
3. `0003_projects.sql`
4. `0004_featured_cap_8.sql`
5. `0005_featured_order.sql`
6. `0006_contact_messages.sql`
7. `0007_featured_col_span.sql`
8. `0008_ratings.sql`
9. `0009_contact_message_read.sql`

The migrations are chronological. Migration 0003 removes the original photo-centric tables from 0001 and replaces them with the active project-centric model. Do not skip earlier files on a new database.

You can paste each file into Supabase SQL Editor and run it once. If using the Supabase CLI, keep the same order and target the intended project.

## Create an admin user

Create the photographer's account in Supabase Dashboard → Authentication → Users. The application has no public sign-up route. Sign-in uses email/password at `/login`.

For a solo deployment, keep public registration disabled and manage the small admin-user set through Supabase.

## Start development

```powershell
bun run dev
```

From the repository root, `bun run dev` starts every app through Turborepo. Use `bun run dev:web` to start only the portfolio (`@lili/web`) `bun run dev:admin` to start only the CMS (`@lili/admin`) or `bun run dev:wedding` to start only the wedding scaffold (`@lili/wedding`).

Open:

- Public site: `http://localhost:3050`
- French site: `http://localhost:3050/fr`
- Admin login: `http://localhost:3051/login`
- Wedding scaffold: `http://localhost:3052` (French at `/fr`; noindex until launch)

The old `http://localhost:3050/admin` and `/login` URLs redirect to the admin app.

## Optional integrations

### OpenRouter

Set `OPENROUTER_API_KEY` to enable translation buttons. `OPENROUTER_MODEL` falls back to the model declared in `.env.example`. Translation is authenticated and is not a public utility.

### Resend

Configure a verified Resend domain, then set the three Resend/contact variables. A contact submission succeeds once its database row is stored; email delivery is best-effort and failures are logged server-side.

## Demo seed

The seed uses the service-role key and deletes all existing project data in the configured database before inserting demos.

The seed script runs from `apps/web`:

```powershell
cd apps\web
bun run seed --force
```

Run it only after confirming the Supabase target may be wiped. Demo images use external Unsplash URLs and do not upload Storage objects.

## Quality checks

```powershell
bun run lint
bun run typecheck
bun run build
```

Use `bun run fix` or `bun run format` only when you intend to rewrite files. See [Troubleshooting](troubleshooting.md) for common failures.
