# Lilis Pics

A bilingual photography portfolio and self-service content management system built with Next.js 16 as a Bun + Turborepo monorepo. Three apps share one Supabase backend: the public portfolio site, a private admin CMS on its own subdomain, and a bilingual wedding site that is currently a scaffold.

## What the project includes

- English and French public routes with localized metadata and sitemap entries.
- A responsive portfolio archive and project galleries backed by Supabase.
- A separate responsive admin for projects, tags, featured layouts, contact messages, ratings, and the links page.
- A localized `/links` bio page with a visual drag-and-drop editor and privacy-conscious click statistics.
- Browser-side image compression with a sequential upload fallback for large requests.
- AI-assisted EN↔FR translation through OpenRouter.
- Contact submissions stored in Postgres with best-effort Resend notifications.
- Single-use bilingual rating links, QR generation, moderation, and approved public testimonials.
- Supabase Auth, Row Level Security, Postgres, and public image storage.
- A bilingual wedding site scaffold (placeholder page, noindex) ready for a future design.

## Apps

| App | Path | Domain | Dev port | Purpose |
| --- | --- | --- | --- | --- |
| `@lili/web` | `apps/web` | `lilispics.com` | 3050 | Public site, links page, rating flow, public API routes |
| `@lili/admin` | `apps/admin` | `admin.lilispics.com` | 3051 | Login, CMS, and every authenticated API route |
| `@lili/wedding` | `apps/wedding` | `wedding.lilispics.com` | 3052 | EN/FR placeholder, noindex until launch |

## Packages

| Package | Purpose |
| --- | --- |
| `@lili/core` | Env, Supabase clients, API envelope and `withAuth`, schemas, DB types, i18n routing, public data layer, mail, translation, revalidation, and all route-handler logic |
| `@lili/ui` | Shared presentational components, hooks, icon maps, motion presets, and theme/base CSS |
| `@lili/config` | Shared TypeScript configuration bases |

## Technology

| Area | Implementation |
| --- | --- |
| Application | Next.js 16.2.7 App Router, React 19.2.4, TypeScript |
| Styling | Tailwind CSS 4, shared CSS tokens, `next/font` |
| Motion | Motion 12 through `motion/react` |
| Localization | next-intl 4 with English and French |
| Backend | Supabase Auth, Postgres, Storage, and RLS |
| Admin state/forms | TanStack Query, React Hook Form, Zod, QRCode |
| Integrations | OpenRouter translation and Resend email |
| Monorepo | Bun workspaces and Turborepo |
| Tooling | Bun and Biome |
| Hosting | Docker images on a self-managed Dokploy server (Traefik, Let's Encrypt), DNS on Cloudflare |

## Architecture at a glance

```text
   lilispics.com            admin.lilispics.com         wedding.lilispics.com
   apps/web  (3050)         apps/admin  (3051)          apps/wedding  (3052)
   public site, rating,     login + CMS + every         EN/FR placeholder
   links, public APIs       authenticated API
        │      ▲                  │                           │
        │      └── POST /api/revalidate (bearer secret) ──────┘ admin → web only
        ▼                         ▼                           ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ @lili/ui  (components, hooks, theme)  →  @lili/core  (logic,    │
   │ data layer, handlers, schemas, Supabase clients)                │
   └────────────────────────────────────────────────────────────────┘
        │                         │
        └──────────── one Supabase project (Auth, Postgres + RLS, Storage)
```

Route files in each app are thin shims over handlers in `@lili/core`. After a CMS edit, the admin asks the web app to drop its cache through the revalidation webhook. Database RLS and `withAuth` remain the security boundaries for data access. See [Architecture](docs/architecture.md).

## Quick start

Prerequisites: [Bun](https://bun.sh/) 1.3.13, a Supabase project, and Node-compatible local tooling.

```powershell
git clone https://github.com/noah-blanchard/simple-lilis-pics.git
cd simple-lilis-pics
bun install
Copy-Item apps\web\.env.example apps\web\.env.local
Copy-Item apps\admin\.env.example apps\admin\.env.local
Copy-Item apps\wedding\.env.example apps\wedding\.env.local
```

Fill in each `.env.local`, apply every SQL file in `supabase/migrations/` in numeric order, and create an admin user in Supabase Auth. Then start development:

```powershell
bun run dev
```

Open [http://localhost:3050](http://localhost:3050) (public site), [http://localhost:3051/login](http://localhost:3051/login) (admin), and [http://localhost:3052](http://localhost:3052) (wedding scaffold).

For the complete setup, migration, and account instructions, read [Local development](docs/local-development.md).

## Routes

### `apps/web`

| Route | Purpose |
| --- | --- |
| `/`, `/fr` | Marketing home |
| `/portfolio`, `/fr/portfolio` | Project archive |
| `/portfolio/[id]`, `/fr/portfolio/[id]` | Project gallery |
| `/links`, `/fr/links` | Public links page |
| `/rate/[locale]/[token]` | Single-use visitor rating experience |
| `/sitemap.xml` | Generated localized sitemap |
| `/admin/*`, `/login` | Redirect to the admin origin (`ADMIN_URL`) |
| `POST /api/contact` | Store a contact inquiry |
| `POST /api/ratings` | Submit a rating |
| `POST /api/links/[id]/click`, `POST /api/links/socials/[id]/click` | Click beacons |
| `POST /api/revalidate` | Cache-revalidation webhook for the admin |

### `apps/admin`

| Route | Purpose |
| --- | --- |
| `/` | Redirects to `/admin` |
| `/login` | Admin sign-in |
| `/admin` | Responsive administration hub |
| `/admin/projects` | Project and tag management |
| `/admin/featured` | Featured bento layout editor |
| `/admin/ratings` | Rating links and testimonial moderation |
| `/admin/messages` | Contact inquiry inbox |
| `/admin/links` | WYSIWYG links editor and click statistics |
| `/robots.txt` | Blocks all crawlers |
| `/api/*` | Authenticated CMS route handlers (see the [API reference](docs/api-reference.md)) |

### `apps/wedding`

| Route | Purpose |
| --- | --- |
| `/`, `/fr` | Placeholder home (noindex) |
| `/robots.txt` | Blocks all crawlers |

## Environment

Each app has its own `.env.local` and `.env.example`. The apps need Supabase public credentials; web and admin also need the server-only service-role key. OpenRouter is required only for admin translation, and Resend is optional because contact messages are stored even when notification email is unavailable.

Never expose or commit server-only keys. See [`apps/web/.env.example`](apps/web/.env.example), [`apps/admin/.env.example`](apps/admin/.env.example), [`apps/wedding/.env.example`](apps/wedding/.env.example) and the [environment reference](docs/local-development.md#environment-variables).

## Scripts

All commands run from the repository root through Turborepo.

| Command | Description |
| --- | --- |
| `bun run dev` | Start every app in development |
| `bun run dev:web` / `dev:admin` / `dev:wedding` | Start one app |
| `bun run build` | Create a production build of every app |
| `bun run typecheck` | Run TypeScript in every package |
| `bun run lint` | Run non-writing Biome checks |
| `bun run fix` | Apply Biome safe fixes |
| `bun run format` | Format supported files |

The demo seed is **destructive** and runs from the web app: `cd apps\web; bun run seed --force`.

## Repository map

```text
apps/
  web/                  Public site: src/{app,components,sections,data,i18n,lib,types}, messages/, public/, scripts/seed.ts
  admin/                CMS: src/{app,components/admin,lib}, proxy.ts (Supabase session guard)
  wedding/              Scaffold: src/app/[locale], messages/
packages/
  core/                 Shared logic: src/{api,data,handlers,i18n,mail,supabase,translate,types,...}
  ui/                   Shared UI: src/{components,lib,links,styles}
  config/               tsconfig bases
supabase/migrations/    Ordered schema, policy, trigger, and storage migrations
docs/                   Developer and operator handbook (docs/plans/ is the migration history)
```

## Documentation

- [Documentation index](docs/README.md)
- [Local development](docs/local-development.md)
- [Architecture](docs/architecture.md)
- [Content and internationalization](docs/content-and-i18n.md)
- [Database and storage](docs/database-and-storage.md)
- [API reference](docs/api-reference.md)
- [Admin guide](docs/admin-guide.md)
- [Deployment (Dokploy)](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

Agent and automation rules live in [`AGENTS.md`](AGENTS.md). It is the canonical directive for this repository.
