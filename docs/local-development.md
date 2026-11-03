# Local development

## Prerequisites

- Bun 1.3.13 installed and available in PowerShell (it is also the script runner), and Node 24 for Next.js tooling.
- A Supabase project you are allowed to configure.
- Access to the Supabase SQL Editor and Auth dashboard.
- Optional OpenRouter and Resend accounts for translation and notification email.
- Optional Docker, only to test the production images locally (see [Deployment](deployment.md)).

The installed dependency versions are authoritative. Do not upgrade them as part of setup.

## Install

From the repository root (one install covers all apps and packages):

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

The wedding app needs the public Supabase variables for the stories data layer, plus `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` and `REVALIDATE_SECRET` for the reply card; the admin also needs `WEDDING_URL`. `NEXT_OUTPUT` is set only by the Dockerfiles (standalone output) and is not an `.env.local` variable.

Generate `REVALIDATE_SECRET` once and paste the same value into both the web and admin files:

```powershell
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

The web and admin apps throw during import when the two public Supabase variables are absent. Routes using the admin client also require the service-role key; it is checked when a route calls the client, not at startup.

For local canonical metadata, set `NEXT_PUBLIC_SITE_URL=http://localhost:3050` in the web app, `http://localhost:3051` in the admin app and `http://localhost:3052` in the wedding app. The web code fallback is `http://localhost:3000`, while the development scripts intentionally run ports 3050 (web), 3051 (admin) and 3052 (wedding).

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
10. `0010_links.sql`
11. `0011_links_editor_lock.sql`
12. `0012_links_page_settings.sql`
13. `0013_social_links.sql`
14. `0014_social_links_rednote.sql`
15. `0015_wedding_stories.sql`
16. `0016_wedding_inquiries.sql`

The migrations are chronological. Migration 0003 removes the original photo-centric tables from 0001 and replaces them with the active project-centric model. Do not skip earlier files on a new database. See [Database and storage](database-and-storage.md) for what each one does.

You can paste each file into Supabase SQL Editor and run it once. If using the Supabase CLI, keep the same order and target the intended project. Migrations are never applied automatically.

## Create an admin user

Create the photographer's account in Supabase Dashboard → Authentication → Users. The application has no public sign-up route. Sign-in uses email/password at the admin's `/login`.

For a solo deployment, keep public registration disabled and manage the small admin-user set through Supabase.

## Start development

```powershell
bun run dev
```

From the repository root, `bun run dev` starts every app through Turborepo. Use `bun run dev:web` to start only the portfolio (`@lili/web`), `bun run dev:admin` to start only the CMS (`@lili/admin`), or `bun run dev:wedding` to start only the wedding scaffold (`@lili/wedding`).

| App | URL |
| --- | --- |
| Public site | `http://localhost:3050` (French at `/fr`) |
| Admin login | `http://localhost:3051/login` |
| Wedding site | `http://localhost:3052` (French at `/fr`, noindex until launch) |

The old `http://localhost:3050/admin` and `/login` URLs redirect to the admin app. The admin and the portfolio talk to each other: the admin calls the portfolio's `/api/revalidate` (through `PORTFOLIO_URL`) after saving the links page, and QR rating links point at the portfolio, so run both apps when testing those flows.

## Optional integrations

### OpenRouter

Set `OPENROUTER_API_KEY` in `apps/admin/.env.local` to enable translation buttons. `OPENROUTER_MODEL` falls back to the model declared in `apps/admin/.env.example`. Translation is authenticated and is not a public utility.

### Resend

Configure a verified Resend domain, then set the three Resend/contact variables in `apps/web/.env.local`. A contact submission succeeds once its database row is stored; email delivery is best-effort and failures are logged server-side.

## Demo seed

The seed uses the service-role key and deletes all existing project data in the configured database before inserting demos. It reads `apps/web/.env.local`, so run it from `apps/web`:

```powershell
cd apps\web
bun run seed --force
```

Run it only after confirming the Supabase target may be wiped. Demo images use external Unsplash URLs and do not upload Storage objects.

## Quality checks

From the repository root:

```powershell
bun run lint
bun run typecheck
bun run build
```

Turborepo runs `typecheck` and `build` for every package and app. Use `bun run fix` or `bun run format` only when you intend to rewrite files. On Windows, `bun run lint` can report formatting errors on files that are LF in git but CRLF in the working copy; see [Troubleshooting](troubleshooting.md) for how to tell.
