# AGENTS.md — Repository Directives

This file is the canonical instruction source for AI agents working in this repository. Tool-specific files such as `CLAUDE.md` and `CODEX.md` may add narrow guidance, but they must defer to this file when instructions overlap.

## 1. Project Context

Lilis Pics is a bilingual English/French photography portfolio and self-service CMS. It is a Bun + Turborepo monorepo of three Next.js apps and three shared packages, backed by **one** Supabase project:

| App | Path | Domain | Role |
| --- | --- | --- | --- |
| `@lili/web` | `apps/web` | `lilispics.com` | Localized public marketing site, portfolio archive, links page, QR rating flow, and the public API routes |
| `@lili/admin` | `apps/admin` | `admin.lilispics.com` | Protected, non-localized CMS and **every authenticated API route** |
| `@lili/wedding` | `apps/wedding` | `wedding.lilispics.com` | EN/FR scaffold: a placeholder home page, noindex, no features yet |

| Package | Purpose |
| --- | --- |
| `@lili/core` | Non-UI shared logic: env, Supabase clients, API envelope and `withAuth`, schemas, DB types, i18n routing, public data layer, mail, translation, cache tags and revalidation, and all route-handler logic |
| `@lili/ui` | Shared presentational components, hooks, icon maps, motion presets, and the theme/base CSS |
| `@lili/config` | Shared TypeScript configuration bases |

Other services: Supabase Auth, Postgres, and Storage; AI-assisted EN↔FR translation through OpenRouter (admin only); contact-message persistence with best-effort Resend notifications (web only). Hosting is a self-managed Dokploy instance (Docker images built from the repository, Traefik, Let's Encrypt). DNS is on Cloudflare.

The checked-in applications, assets, translations, migrations, and documentation are the current product truth. Do not refer to or depend on the deleted `REFERENCE_PROJECT/` directory. `docs/plans/monorepo/` is the historical record of the migration, not a source of current rules.

## 2. Read Before Changing Code

This is **Next.js 16.2.7**, not an older Next.js release. APIs, conventions, and file structure may differ from prior versions.

- Read the relevant installed guide under `node_modules/next/dist/docs/` before writing or changing Next.js code. Bun installs workspace packages in isolated per-package folders, so there is no root copy: use `apps/web/node_modules/next/dist/docs/` (any app's `node_modules/next` works).
- Heed deprecation notices and follow the installed version rather than memory.
- Inspect the implementation and configuration before proposing architectural changes.
- Read the relevant document under `docs/` when changing a documented subsystem, then update that documentation in the same change.

## 3. Installed Stack and Commands

Use installed versions only. Do not upgrade, replace, or add dependencies without explicit approval.

- Next.js 16.2.7 with App Router and `src/proxy.ts` in each app that needs one
- React 19.2.4 and TypeScript 5
- Tailwind CSS 4 with `@tailwindcss/postcss`
- Motion 12 via `motion/react`
- next-intl 4
- Supabase JS/SSR
- TanStack Query 5, React Hook Form, and Zod 4
- OpenRouter SDK and Resend
- QRCode for single-use rating links
- Biome 2.2.0 (one root configuration for the whole repository)
- Bun 1.3.13 as package manager and script runner, Turborepo 2.11.10 for task orchestration
- Docker images deployed through Dokploy

Repository commands (run from the repository root):

```powershell
bun install
bun run dev                # every app through Turborepo
bun run dev:web            # apps/web on 3050
bun run dev:admin          # apps/admin on 3051
bun run dev:wedding        # apps/wedding on 3052
bun run build
bun run typecheck
bun run lint
bun run fix
bun run format
```

The demo seed lives in `apps/web`: `cd apps\web; bun run seed --force`. It is destructive: it clears project data in the configured Supabase instance. Never run it without explicit authorization and a verified target.

## 4. Architecture Boundaries

- App-local code lives in `apps/<app>/src`, and `@/` means "this app's `src`".
- **Packages never use `@/`.** Inside a package, use relative imports for same-package modules and `@lili/<pkg>/<subpath>` for other packages.
- **No barrel files in packages.** Import precise subpaths. This keeps server-only modules (service-role client, Resend, OpenRouter) out of client bundles.
- Dependency direction: apps → `@lili/ui` → `@lili/core`. `@lili/core` never imports `@lili/ui` or an app, `@lili/ui` never imports an app, and apps never import each other.
- `@lili/core` holds env, Supabase clients, the API envelope/validate/`withAuth`/client, Zod schemas, `types/db`, i18n routing, the public data layer (`data/*`), mail, server-side translation, rating helpers, cache tags and revalidation, and **all route-handler logic** (`handlers/*`).
- Route files in apps are shims (`export const POST = handler;`). Route segment config (`runtime`, `dynamic`, `maxDuration`, …) stays in the app's route file because Next reads it statically.
- Admin owns every authenticated CMS route, plus `GET /api/projects` and `GET /api/tags`. Public apps expose only their public writes and `POST /api/revalidate`.
- Cross-app cache invalidation goes through `requestPublicRevalidation()` (core) → `POST /api/revalidate` on the public apps. Never call `revalidateTag` from admin code expecting it to reach another app's cache.
- Components stay presentational and prop-driven (`@lili/ui` and each app's `components/`). They must not fetch data or contain server-only work. Fetch data at server/page/section edges through `@lili/core/data/*` and pass resolved view models into components.
- Keep raw Supabase row shapes inside the data and API boundaries; use the parsing/resolution layer before rendering public UI.
- Use TanStack Query for admin-side API state and invalidation.
- Place page-level composition in `apps/web/src/sections/`, static marketing data in `apps/web/src/data/`, and app-local view types in the app's `src/types/`.
- New shared code goes in `@lili/core` if it is logic without React, or in `@lili/ui` if it renders or uses hooks. Everything else stays app-local.
- Keep server-only secrets and service-role access out of Client Components and browser bundles.
- Preserve the standard API envelope from `@lili/core/api/response` for all `/api` handlers.

## 5. Next.js, Styling, and Motion

- Use the App Router conventions documented by the installed Next.js version.
- Next.js 16 calls the request interception file `proxy.ts`; do not recreate `middleware.ts`.
- Use Tailwind utilities for component styling. Keep global CSS limited to resets, shared tokens, and behavior that cannot reasonably live in utilities.
- Each app's `globals.css` imports `@lili/ui/styles/theme.css` and `base.css` and declares `@source "../../../../packages/ui/src"`. Shared components must live under `packages/ui/src` to be scanned, or their Tailwind classes silently disappear.
- Use `next/font` for fonts; do not import remote fonts from CSS. Each app declares its own fonts.
- Use `motion/react` for animation and shared motion primitives from `@lili/ui/lib/motion` where applicable. Do not add CSS keyframes or Tailwind `transition-*` utilities for animation.
- Preserve performance, accessibility, reduced-motion behavior, and layout stability.

## 6. Content and Internationalization

- Marketing copy is per app: `apps/web/messages/{en,fr}.json` and `apps/wedding/messages/{en,fr}.json`. Each app keeps its own EN/FR key parity.
- Routing configuration is shared: `@lili/core/i18n/routing`. English uses unprefixed routes; French uses `/fr` through next-intl's `localePrefix: "as-needed"` configuration. The admin is English-only and not localized.
- Runtime project, photo, link, and tag content is managed through the admin CMS and Supabase.
- Update metadata, sitemap behavior, and both languages when a public route or public copy changes.
- The wedding app stays noindex until the wedding product is designed and launched.

## 7. Data, Auth, and Security

- Supabase RLS is the database security boundary. Proxy redirects are navigation/session conveniences, not authorization by themselves.
- Mutating CMS routes must remain authenticated through `withAuth` and use server-only service-role access where implemented. The Supabase session proxy exists only in `apps/admin`; admin session cookies are host-only on `admin.lilispics.com`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `RESEND_API_KEY`, `REVALIDATE_SECRET`, or other server secrets to client code, logs, documentation examples, Docker build arguments, or commits.
- Each app has its own `.env.local` (git-ignored) and `.env.example` (committed). Do not read, print, or commit `.env.local` values. Use `.env.example` for documented variable names.
- `NEXT_PUBLIC_*` values (and web's `ADMIN_URL`) are inlined at build time, so they are Docker build arguments. Server secrets are runtime-only.
- Read server secrets inside functions, never at module scope, so `next build` needs no secrets.
- `REVALIDATE_SECRET` must be identical in `apps/web` and `apps/admin`.
- Preserve public-read/private-write policies, rating approval gates, and the private handling of visitor submissions.
- Treat migrations and storage operations as potentially destructive. Verify the target and migration order before execution. Migrations are applied manually and are shared by all apps.

## 8. Change Discipline and Verification

- Keep changes scoped to the requested work. Do not perform opportunistic dependency upgrades or unrelated refactors. When moving a dependency between `package.json` files, copy its exact range and confirm in `bun.lock` that no installed package changed version.
- Preserve user changes in a dirty worktree and never discard them without explicit approval.
- Split implementation into explicit steps. After each agreed step, summarize the result and wait for user confirmation before continuing.
- The user normally runs project commands manually in PowerShell. Provide the exact command and working-directory instruction, then wait. Only run commands yourself when the active user request explicitly authorizes that action.
- For code changes, validate proportionally with `bun run lint`, `bun run typecheck`, and `bun run build` from the root; Turborepo runs them for every affected app and package.
- The repository stores LF line endings. With `core.autocrlf=true` on Windows, many working files are CRLF and `bun run lint` reports formatting errors that do not exist in git. Check `git ls-files --eol <file>` (`i/lf w/crlf` is a checkout artifact) before treating them as real, and do not mass-reformat unrelated files.
- For documentation changes, also validate links, paths, commands, environment-variable names, and `git diff --check`.

## 9. Documentation Maintenance

- Keep the root `README.md` concise and useful as the project entry point.
- Keep detailed setup, architecture, data, API, admin, deployment, and troubleshooting guidance under `docs/`. [`docs/deployment.md`](docs/deployment.md) is the Dokploy runbook.
- Prefer links to the canonical detailed document instead of duplicating long instructions.
- Document the final current state of the schema; distinguish historical migration steps from active tables and constraints.
- When behavior, routes, scripts, environment variables, or operational limits change, update the relevant documentation in the same change.
