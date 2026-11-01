# Architecture

## System overview

Lilis Pics is a Bun + Turborepo monorepo of three Next.js App Router apps and three shared packages, all backed by one Supabase project.

| App | Origin | Responsibility |
| --- | --- | --- |
| `apps/web` | `lilispics.com` | Localized public site, `/links` page, token-gated bilingual rating experience, public API routes, cache-revalidation webhook |
| `apps/admin` | `admin.lilispics.com` | Authenticated CMS (`/login`, `/admin/*`) and every authenticated API route |
| `apps/wedding` | `wedding.lilispics.com` | EN/FR placeholder page, noindex. No features yet. |

| Package | Responsibility |
| --- | --- |
| `@lili/core` | Logic without React: env, Supabase clients, API envelope/validation/`withAuth`/client, Zod schemas, `types/db`, i18n routing, public data layer, mail, translation, rating helpers, cache tags and revalidation, and **all route-handler logic** |
| `@lili/ui` | Anything that renders or uses hooks and is shared: components, motion presets, bento and media-query helpers, link and social icon maps, theme tokens and base CSS |
| `@lili/config` | `tsconfig` bases (`tsconfig.base.json`, `tsconfig.nextjs.json`) |

The public `/links` page and the admin Links editor preview render the same presentational components from `@lili/ui`. Its content and banner are managed as an atomic snapshot in the visual admin editor.

## Request flows

```text
Public request (web)
  → apps/web/src/proxy.ts → next-intl → Server page/section
  → @lili/core/data/* → Supabase under RLS (anon key)
  → resolved view model → presentational components

Admin request (admin)
  → apps/admin/src/proxy.ts → Supabase session refresh/redirect
  → Client dashboard + TanStack Query
  → authenticated /api route (shim) → @lili/core/handlers/* → withAuth → service-role Supabase client
  → Postgres or Storage

Rating request (web)
  → /rate/[locale]/[token] → server-side token availability check
  → public POST /api/ratings → atomic single-use claim
  → admin moderation → approved public testimonial

Wedding request (wedding)
  → apps/wedding/src/proxy.ts → next-intl → static EN/FR placeholder
```

## Route organization

Each app owns its routes under `src/app/`. Route files in `api/` are shims that assign a handler from `@lili/core/handlers/*` to a method export, for example `export const POST = submitRating;`.

**`apps/web`**

- `[locale]/` holds localized public pages, including `[locale]/links/` (`/links` in English and `/fr/links` in French).
- `(rate)/` holds the QR-opened rating experience, which carries its locale as a path segment.
- `api/` holds only public routes: `POST /api/contact`, `POST /api/ratings`, the two click beacons, and `POST /api/revalidate`.
- `sitemap.ts` generates localized static and project URLs.
- `next.config.ts` redirects `/admin/:path*` and `/login` to `ADMIN_URL`.
- `proxy.ts` composes next-intl routing and lets `/rate/*` through untouched.

**`apps/admin`**

- `login/` and `admin/` hold the CMS pages. The historical `/admin/*` paths are kept.
- `api/` holds every authenticated route, plus `GET /api/projects` and `GET /api/tags`, which only the admin calls.
- `robots.ts` disallows every crawler and the layout sets `noindex`.
- `next.config.ts` redirects `/` to `/admin`.
- `proxy.ts` is the only Supabase session proxy in the repository.

**`apps/wedding`**

- `[locale]/layout.tsx` and `[locale]/page.tsx` render the placeholder; `robots.ts` disallows every crawler.

English is served without a prefix. French is served under `/fr` (routing is shared from `@lili/core/i18n/routing`).

## Package boundaries

The rules are in [`AGENTS.md` §4](../AGENTS.md). In short:

- Dependency direction is apps → `@lili/ui` → `@lili/core`. Apps never import each other.
- Packages use relative imports internally and `@lili/<pkg>/<subpath>` across packages; `@/` is only valid inside an app and means that app's `src`.
- There are no barrel files, so a server-only module (the service-role client, Resend, OpenRouter) can never reach a client bundle through an index.
- Packages are TypeScript source with no build step. Each app compiles them through `transpilePackages: ["@lili/core", "@lili/ui"]`.
- Each app's `globals.css` registers `packages/ui/src` with `@source`, so Tailwind scans the shared components.

## Component and data boundaries

- `apps/web/src/components/` holds typed presentational components and focused UI behavior; `@lili/ui/components` holds the shared ones.
- `apps/web/src/sections/` assembles page-level public sections.
- `apps/web/src/data/` holds static typed marketing lists.
- `@lili/core/data/*` fetches and resolves database records for public rendering.
- `apps/admin/src/components/admin/` owns client-side CMS state, forms, modals, and query invalidation.
- `@lili/core/types/db` models database rows and relationship results; `apps/web/src/types/index.ts` models UI-facing content.

Public components receive resolved `Project` values rather than raw Supabase relationship shapes. Resolution localizes text, orders photos, converts Storage keys to public URLs, maps tags, and selects the cover.

## Admin application

The responsive admin uses Supabase browser auth, TanStack Query, React Hook Form, browser image compression, QR generation, and Motion reorder controls. Separate sections manage projects/tags, the featured bento layout, ratings, contact messages, and the links page.

The Links section is a WYSIWYG editor: local drafts drive the shared public preview, Motion reorders the regular-link and social-icon collections and replays the welcome sequence, and one authenticated `PUT /api/links` reconciles the complete snapshot in a Postgres transaction. Timestamps detect stale editor tabs before any write is applied. The social-icon collection is scoped to the links page; home, menu, and footer profiles remain static marketing data.

## Cache revalidation across apps

The public links data is cached in the web app with `unstable_cache` (tag `public-links`, 300-second window). Because the admin is a different app, it cannot call `revalidateTag` on web's cache. Instead:

```text
Admin saves links (PUT /api/links)
  → @lili/core/revalidate: requestPublicRevalidation(["public-links"])
  → POST {PORTFOLIO_URL}/api/revalidate   Authorization: Bearer <REVALIDATE_SECRET>
  → web: handleRevalidateWebhook → revalidateTag("public-links", { expire: 0 })
  → the next public request reads fresh data
```

The call is best effort: a failure is logged as `[revalidate] …` and never fails the admin save, and the cache still expires on its own after 300 seconds. The webhook accepts only whitelisted tags (`@lili/core/cache-tags`), compares the secret in constant time, and returns 503 when `REVALIDATE_SECRET` is not configured. `PORTFOLIO_URL` and `REVALIDATE_SECRET` must therefore be set in the admin, and `REVALIDATE_SECRET` must match web's.

`PORTFOLIO_URL` is also the origin of the QR rating URLs the admin generates, because `/rate/...` is served by the web app.

## Authentication and authorization

`apps/admin/src/proxy.ts` refreshes the Supabase session and redirects unauthenticated `/admin*` requests to `/login` and authenticated `/login` requests to `/admin`. Session cookies are host-only on `admin.lilispics.com`, so public apps never receive them. The public apps have no auth proxy.

Proxy is not the security boundary. `withAuth` verifies users before mutations, RLS protects direct data access, and the service-role client remains server-only. The service-role key is read inside `createSupabaseAdminClient()` at call time, never at module load.

## Integrations

- **Supabase:** Auth sessions, Postgres content/contact data, and public image Storage. One project serves all apps.
- **OpenRouter (admin):** authenticated, bounded translation requests with server-side prompts and timeout handling.
- **Resend (web):** best-effort notification after a contact message has been stored; failures do not discard inquiries.
- **QRCode (admin):** renders short-lived, single-use EN/FR rating URLs for visitors.

## Styling and motion

Tailwind utilities provide component styling. The shared tokens live in `packages/ui/src/styles/theme.css` and the base styles in `base.css`; each app's `src/app/globals.css` imports both. Each app declares its own `next/font` fonts. Animation uses `motion/react` and shared settings from `@lili/ui/lib/motion`.

## Build and runtime

Each app builds into its own Docker image (`apps/<app>/Dockerfile`, build context = repository root) using Next.js standalone output, enabled with `NEXT_OUTPUT=standalone`. `NEXT_PUBLIC_*` values and web's `ADMIN_URL` are inlined at build time; server secrets are runtime environment only. See [Deployment](deployment.md).

## Next.js version rule

Read the relevant installed guide under `apps/web/node_modules/next/dist/docs/` before changing framework code. In this release, interception uses `proxy.ts`, handlers live under `app`, and implemented dynamic `params` are asynchronous. See [`AGENTS.md`](../AGENTS.md).
