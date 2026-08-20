# Architecture

## System overview

Lilis Pics is a Next.js App Router application with a localized public site, a non-localized authenticated admin CMS, a token-gated bilingual rating experience, and route handlers for public submissions/reads and authenticated mutations.

The public site also includes a localized `/links` bio page. Its content and
banner presentation are managed as an atomic snapshot in a visual admin
editor; public rendering and the editor preview share the same presentational
link components.

```text
Public request
  → src/proxy.ts → next-intl → Server page/section
  → public data layer → Supabase under RLS
  → resolved view model → presentational components

Admin request
  → src/proxy.ts → Supabase session refresh/redirect
  → Client dashboard + TanStack Query
  → authenticated /api route → service-role Supabase client
  → Postgres or Storage

Rating request
  → /rate/[locale]/[token] → server-side token availability check
  → public /api/ratings submission → atomic single-use claim
  → admin moderation → approved public testimonial
```

## Route organization

- `src/app/[locale]/` contains localized public pages.
- `src/app/[locale]/links/` renders `/links` in English and `/fr/links` in French.
- `src/app/(admin)/` contains `/login` and `/admin` without adding a URL segment.
- `src/app/api/` contains Web Request/Response route handlers.
- `src/app/(rate)/` contains the QR-opened rating experience.
- `src/app/sitemap.ts` generates localized static and project URLs.
- `src/proxy.ts` is the single Next.js 16 Proxy entry point.

English is served without a prefix. French is served under `/fr`.

## Component and data boundaries

- `src/components/` holds typed presentational components and focused UI behavior.
- `src/sections/` assembles page-level public sections.
- `src/data/` holds static typed marketing lists.
- `src/lib/data/` fetches and resolves database records for public rendering.
- `src/components/admin/` owns client-side CMS state, forms, modals, and query invalidation.
- `src/types/db.ts` models database rows and relationship results.
- `src/types/index.ts` models UI-facing content.

Public components receive resolved `Project` values rather than raw Supabase relationship shapes. Resolution localizes text, orders photos, converts Storage keys to public URLs, maps tags, and selects the cover.

## Admin application

The responsive admin uses Supabase browser auth, TanStack Query, React Hook Form, browser image compression, QR generation, and Motion reorder controls. Separate sections manage projects/tags, the featured bento layout, ratings, and contact messages.

The Links section is a WYSIWYG editor: local drafts drive the shared public
preview, Motion reorders the regular-link and social-icon collections and
replays the welcome sequence, and one authenticated `PUT /api/links` reconciles
the complete snapshot in a Postgres transaction. Timestamps detect stale editor
tabs before any write is applied. The social-icon collection is scoped to the
links page; home, menu, and footer profiles remain static marketing data.

## Authentication and authorization

`src/proxy.ts` refreshes the session and redirects unauthenticated `/admin*` requests to `/login` and authenticated `/login` requests to `/admin`.

Proxy is not the security boundary. `withAuth` verifies users before mutations, RLS protects direct data access, and the service-role client remains server-only.

## Integrations

- **Supabase:** Auth sessions, Postgres content/contact data, and public image Storage.
- **OpenRouter:** authenticated, bounded admin translation requests with server-side prompts and timeout handling.
- **Resend:** best-effort notification after the contact message has been stored; failures do not discard inquiries.
- **QRCode:** renders short-lived, single-use EN/FR rating URLs for visitors.

## Styling and motion

Tailwind utilities provide component styling. `src/app/globals.css` and `src/styles/theme.css` contain shared resets/tokens. Fonts use `next/font`. Public animation uses `motion/react` and shared settings from `src/lib/motion.ts`.

## Next.js version rule

Read the relevant installed guide under `node_modules/next/dist/docs/` before changing framework code. In this release, interception uses `proxy.ts`, handlers live under `app`, and implemented dynamic `params` are asynchronous. See [`AGENTS.md`](../AGENTS.md).
