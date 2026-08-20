# Lilis Pics

A bilingual photography portfolio and self-service content management system built with Next.js 16. The public experience combines a motion-led marketing page with a project archive, while the private admin area manages projects, galleries, tags, featured layouts, and EN/FR translations.

## What the project includes

- English and French public routes with localized metadata and sitemap entries.
- A responsive portfolio archive and project galleries backed by Supabase.
- A responsive admin hub for projects, tags, featured layouts, contact messages, and ratings.
- Browser-side image compression with a sequential upload fallback for large requests.
- AI-assisted EN↔FR translation through OpenRouter.
- Contact submissions stored in Postgres with best-effort Resend notifications.
- Single-use bilingual rating links, QR generation, moderation, and approved public testimonials.
- Supabase Auth, Row Level Security, Postgres, and public image storage.

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
| Tooling | Bun and Biome |

## Architecture at a glance

```text
Browser
├── Public site (/ and /fr)
│   └── Server pages/sections → public data layer → Supabase
├── Admin (/login and /admin)
│   └── Projects/messages/ratings → authenticated route handlers → Supabase admin client
├── Rating flow (/rate/en|fr/[token])
│   └── single-use token → public submission → moderated testimonial
└── Contact form
    └── public route handler → private contact_messages row → optional Resend notice
```

`src/proxy.ts` composes next-intl routing with Supabase session refresh and admin redirects. Database RLS and authenticated API wrappers remain the security boundaries for data access.

## Quick start

Prerequisites: [Bun](https://bun.sh/), a Supabase project, and Node-compatible local tooling.

```powershell
git clone https://github.com/noah-blanchard/simple-lilis-pics.git
cd simple-lilis-pics
bun install
Copy-Item .env.example .env.local
```

Fill in `.env.local`, apply every SQL file in `supabase/migrations/` in numeric order, and create an admin user in Supabase Auth. Then start development:

```powershell
bun run dev
```

Open [http://localhost:3050](http://localhost:3050). The admin sign-in is at `/login`.

For the complete setup, migration, and account instructions, read [Local development](docs/local-development.md).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | English marketing home |
| `/fr` | French marketing home |
| `/portfolio` | English project archive |
| `/fr/portfolio` | French project archive |
| `/portfolio/[id]` | English project gallery |
| `/fr/portfolio/[id]` | French project gallery |
| `/login` | Admin sign-in |
| `/admin` | Responsive administration hub |
| `/admin/projects` | Project and tag management |
| `/admin/featured` | Featured bento layout editor |
| `/admin/ratings` | Rating links and testimonial moderation |
| `/admin/messages` | Contact inquiry inbox |
| `/rate/[locale]/[token]` | Single-use visitor rating experience |
| `/api/*` | Public and authenticated route handlers |
| `/sitemap.xml` | Generated localized sitemap |

## Environment

The application requires Supabase public credentials and a server-only service-role key. OpenRouter is required only for admin translation, and Resend is optional because contact messages are stored even when notification email is unavailable.

Never expose or commit server-only keys. See [`.env.example`](.env.example) and the [environment reference](docs/local-development.md#environment-variables).

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start Next.js development on port 3050 |
| `bun run build` | Create a production build |
| `bun run start` | Serve the production build |
| `bun run lint` | Run non-writing Biome checks |
| `bun run fix` | Apply Biome safe fixes |
| `bun run format` | Format supported files |
| `bun run typecheck` | Run TypeScript without emitting files |
| `bun run seed --force` | **Destructively** replace project data with demos |

## Repository map

```text
messages/              EN/FR marketing translations
public/                Checked-in static photography and decorative assets
scripts/seed.ts         Destructive demo-data seed
src/app/                Public, admin, rating, API, metadata, and sitemap routes
src/components/         Presentational and admin UI components
src/data/               Static typed marketing data
src/i18n/               next-intl routing and request configuration
src/lib/                API, data, mail, translation, Supabase, and UI helpers
src/sections/           Page-level public sections
src/types/              Shared view and database shapes
supabase/migrations/    Ordered schema, policy, trigger, and storage migrations
docs/                   Developer and operator handbook
```

## Documentation

- [Documentation index](docs/README.md)
- [Local development](docs/local-development.md)
- [Architecture](docs/architecture.md)
- [Content and internationalization](docs/content-and-i18n.md)
- [Database and storage](docs/database-and-storage.md)
- [API reference](docs/api-reference.md)
- [Admin guide](docs/admin-guide.md)
- [Vercel deployment](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

Agent and automation rules live in [`AGENTS.md`](AGENTS.md). It is the canonical directive for this repository.
