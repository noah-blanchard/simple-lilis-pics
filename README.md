# Lilis Pics

A bilingual (EN/FR) photography portfolio with a self-serve admin CMS. The
public site is a motion-driven marketing page plus a project archive; the
`/admin` area lets the photographer manage projects, photos and tags, backed by
Supabase (Auth + Postgres + Storage) with AI-assisted FR↔EN translation.

## Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript 5**
- **Tailwind CSS 4** (`@tailwindcss/postcss`) — all animation via **motion/react**
- **next-intl 4** — locales `en` / `fr`, routing via `src/proxy.ts` (Next 16's
  renamed middleware)
- **Supabase** (`@supabase/ssr`, `@supabase/supabase-js`) — Auth, Postgres, Storage
- **TanStack Query 5** + **react-hook-form** + **zod** — the admin data/forms
- **OpenRouter SDK** — translation endpoint (`/api/translate`)
- **Biome 2** — lint + format · **Bun** — package manager / scripts

## Getting started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env.local` and fill it in (Supabase keys, optional
   OpenRouter key, site URL). See the comments in `.env.example`.

3. Apply the database migrations in `supabase/migrations/` (via the Supabase SQL
   editor or CLI), which create the `tags` / `projects` / `project_photos` /
   `project_tags` tables, RLS policies, and the public `photos` storage bucket.

4. (Optional) Seed demo projects — **destructive**, wipes all project data:

   ```bash
   bun run seed --force
   ```

5. Run the dev server:

   ```bash
   bun run dev
   ```

   Open http://localhost:3000 — it redirects to the default locale. The admin
   lives at `/login` → `/admin`.

## Scripts

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `bun run dev`        | Start the dev server                 |
| `bun run build`      | Production build                     |
| `bun run start`      | Serve the production build           |
| `bun run lint`       | Biome check (lint + format, no write) |
| `bun run fix`        | Biome check with `--write`           |
| `bun run format`     | Biome format with `--write`          |
| `bun run typecheck`  | `tsc --noEmit`                       |
| `bun run seed --force` | Seed demo data (wipes projects)    |

## Project structure

```
src/
  app/
    [locale]/        public localized site (home, /portfolio, /portfolio/[id])
    (admin)/         non-localized admin area (/login, /admin)
    api/             route handlers (projects, tags, translate)
  components/        presentational components (+ components/admin, theme, nav)
  sections/          page-level sections that assemble components
  data/              static typed content for the marketing sections
  lib/               api envelope, data layer, supabase clients, translate, motion/ui tokens
  i18n/              next-intl routing/request/navigation
  types/             shared types (db row + resolved shapes)
messages/            en.json / fr.json (kept at key parity)
supabase/migrations/ SQL schema, RLS and storage setup
```

## Content & i18n

- Marketing copy lives in `messages/{en,fr}.json`; keep both files at key parity.
- Project/photo/tag content is managed at runtime through the `/admin` dashboard.
- All animation goes through `motion/react` (see `src/lib/motion.ts`); avoid CSS
  keyframes / Tailwind `transition-*` on the public site.

## Auth model

`/admin*` and `/login` are gated in `src/proxy.ts` (Supabase session → redirect).
Mutating API routes are wrapped in `withAuth`; the real security boundary is
Postgres RLS. The `service_role` key is used only server-side in the API routes.
