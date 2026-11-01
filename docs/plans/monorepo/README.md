# Monorepo migration: master plan

> **Status: completed (2026-11-01).** This folder is the historical record of
> the migration. Current documentation lives in `AGENTS.md`, `README.md`, and
> `docs/`.

This folder contains the full plan for turning the single Next.js app into a
Bun + Turborepo monorepo with three apps that share one backend, and for moving
hosting from Vercel to a self-hosted Dokploy instance.

The plans are written for an AI coding agent (Claude Sonnet 5.5) to execute one
phase at a time. Every phase file is meant to be self-sufficient when read
together with **this README**. Read this whole file first, every session.

---

## 0. How to use these plans

### For the human operator (Noah)

1. Work only on the branch `refactor/monorepo`. `master` keeps deploying to
   Vercel untouched until the production cutover (phase 07).
2. Run **one phase per agent session**. Start the session with a prompt like:

   > Read `AGENTS.md`, then `docs/plans/monorepo/README.md`, then
   > `docs/plans/monorepo/0X-<name>.md`. Execute phase 0X exactly as written,
   > on branch `refactor/monorepo`. You are authorized to run `bun`, `bunx`,
   > `git` (add/mv/rm/status/diff/log; no commit, no push, no rebase, no reset),
   > `docker` (phase 06 only), and read-only shell commands. Do not read
   > `.env.local`. Stop at the end of the phase and give me the report
   > described in the plan.

   If you prefer to run commands yourself (the default in `AGENTS.md`), omit
   the authorization sentence. The agent must then hand you each command and
   wait.
3. Phases are strictly ordered. Do not start a phase until the previous one's
   "Definition of done" is satisfied and the operator has committed it.
4. Some steps are **operator-only** (marked 🧑). They involve secrets, DNS,
   dashboards, or production. The agent must stop and ask you to do them.
5. Push the branch when you want a remote backup (`git push -u origin refactor/monorepo`).
   The agent never pushes unless you tell it to.

### For the executing agent

- Read, in order: `AGENTS.md`, this README, the phase file. Then re-read the
  "Golden rules" section below before writing any code.
- Execute the phase's steps **in order**. Do not skip ahead, do not merge
  phases, and do not "improve" things outside the phase's scope.
- When the plan gives an exact file content, write exactly that content
  (adapting only where the plan explicitly says "adapt").
- When the plan says **STOP**, stop and report to the user.
- If reality differs from the plan (a file is missing, an import isn't where
  the plan says, a command fails for a reason the plan didn't anticipate),
  **do not improvise a large workaround**. Make the smallest correct fix if it
  is obvious and local. Otherwise stop and report what you found, what you
  expected, and the options.
- At the end of every phase, produce the **phase report** (template in §9).

---

## 1. Context: what the project is today

Lilis Pics is a bilingual (EN/FR) photography portfolio with a self-service
CMS, for the photographer Lili. Today it is **one** Next.js 16.2.7 App Router
app at the repository root, deployed on Vercel:

| Area | Location today | Notes |
| --- | --- | --- |
| Public site | `src/app/[locale]/` | `/`, `/portfolio`, `/portfolio/[id]`, `/links`, with French under `/fr` (next-intl, `localePrefix: "as-needed"`) |
| Rating flow | `src/app/(rate)/rate/[locale]/[token]` | QR-opened, its own `<html>` root layout, bypasses next-intl in `proxy.ts` |
| Admin CMS | `src/app/(admin)/` | `/login`, `/admin/*`. Own `<html>` root layout. TanStack Query and React Hook Form |
| API | `src/app/api/` | 15 route files. Mostly `withAuth` admin mutations, plus 4 public endpoints |
| Proxy | `src/proxy.ts` | Composes the Supabase admin session guard with next-intl |
| Backend | Supabase Cloud | Auth, Postgres (RLS), Storage bucket `photos` |
| Integrations | OpenRouter (admin translation), Resend (contact notifications) | server-only keys |

Key facts the plans rely on (verified against the code on 2026-11-01):

- **Public reads do not go through `/api`.** Server components read Supabase
  directly through `src/lib/data/*` under RLS. The `/api` routes are the admin
  CMS plus 4 public writes:
  - `POST /api/contact` (contact form)
  - `POST /api/ratings` (rating submission)
  - `POST /api/links/[id]/click` and `POST /api/links/socials/[id]/click`
    (beacons)
- Two route files mix public and admin methods:
  - `api/contact/route.ts` has `GET` (auth) and `POST` (public).
  - `api/ratings/route.ts` has `POST` (public) and `GET` (auth).
- `api/projects/route.ts` `GET` and `api/tags/route.ts` `GET` have no auth
  wrapper, but **only the admin calls them**.
- The admin `PUT /api/links` calls `revalidateTag("public-links", { expire: 0 })`
  to bust the `unstable_cache` in `src/lib/data/links.ts` (tag `public-links`,
  `revalidate: 300`). **Once admin is a separate app, this call can no longer
  reach the portfolio's cache.** Phase 05 replaces it with a cross-app
  revalidation webhook.
- `src/lib/rating.ts` → `buildRateUrl()` builds QR URLs from
  `NEXT_PUBLIC_SITE_URL`. Once admin lives on `admin.lilispics.com`, QR codes
  must still point at `lilispics.com`. Phase 05 adds `PORTFOLIO_URL`.
- The admin **Links editor** renders the public `LinksPageContent` component as
  a live preview, and uses `publicFontVariables` and `/logo.webp`. The admin
  therefore needs shared UI (phase 04).
- `src/lib/supabase/admin.ts` throws **at module load** when
  `SUPABASE_SERVICE_ROLE_KEY` is missing. Vercel exposes it at build time;
  Docker builds should not. Phase 06 makes the check lazy.
- The link-click routes compare the `Origin` header to
  `new URL(request.url).origin`. Behind Traefik (Dokploy), `request.url` can
  carry the internal protocol or host. Phase 06 hardens this.
- `next.config.ts` derives the Supabase Storage hostname for `next/image` from
  `NEXT_PUBLIC_SUPABASE_URL`.
- Fonts come from `next/font/google` in `src/lib/fonts.ts`: the public font set
  plus a separate admin font set. The rate layout declares its own fonts.
- Tailwind CSS 4 runs through `@tailwindcss/postcss`. Tokens are in
  `src/styles/theme.css`, and global CSS and utilities in `src/app/globals.css`.
- Supabase migrations in `supabase/migrations/` are **applied manually** in the
  Supabase SQL editor. A committed migration is not an applied migration.
- Tooling: Bun **1.3.13** (package manager and script runner), Node **24.x**
  locally, Biome **2.2.0**, TypeScript 5.

---

## 2. Decisions (approved by the user)

| # | Decision | Rationale |
| --- | --- | --- |
| D1 | **Bun workspaces + Turborepo** | Bun is already the package manager. Turbo adds task orchestration (`turbo run build --filter=...`), caching, and per-app dev servers. |
| D2 | **Three apps**: `apps/web` (lilispics.com), `apps/admin` (admin.lilispics.com), `apps/wedding` (wedding.lilispics.com) | Independent deploys. Admin cookies live only on the admin subdomain. Public apps ship no CMS code. |
| D3 | **Backend = shared packages, served by the apps.** Domain logic, Supabase clients, schemas, the API envelope, `withAuth` and all route-handler logic live in `@lili/core`. Each app's `app/api/**/route.ts` is a 2–4 line shim that mounts the handlers it needs. | Shares the backend without a separate API server, CORS, or cross-subdomain auth. Handlers are plain `(Request, ctx) → Response`, so extracting a standalone API (e.g. Hono on `api.lilispics.com`) later is cheap. |
| D4 | **Admin owns all authenticated CMS routes.** Public apps own only their public write routes and a `/api/revalidate` webhook. | Least privilege: no admin mutation endpoint exists on public origins. |
| D5 | **Packages are "just-in-time" TypeScript**: no build step. They export `.ts`/`.tsx` source through `exports` maps, and apps compile them via `transpilePackages`. | No dist folders, no watch builds. Next compiles everything. |
| D6 | **No barrel files** in packages. Every import uses a precise subpath (`@lili/core/api/response`). | Prevents server-only modules (service-role client, Resend, OpenRouter) from leaking into client bundles through an `index.ts`. |
| D7 | **One Supabase project, unchanged schema.** Migrations stay at repo-root `supabase/migrations/`. | The wedding content model (e.g. a `site` discriminator) is explicitly **out of scope** for now. |
| D8 | **Supabase stays on Supabase Cloud during this project.** Self-hosting Supabase on Dokploy is a separate, later decision (see `99-future-self-hosted-supabase.md`). | It changes one variable at a time, and self-hosted Supabase adds roughly 10 services to operate. |
| D9 | **Hosting moves to Dokploy**: one Dokploy *Application* per app, Dockerfile builds, Next `output: "standalone"`, Traefik for TLS and subdomains. | User decision. |
| D10 | **The admin keeps its current paths** (`/login`, `/admin/...`) on the new origin. `admin.lilispics.com/` redirects to `/admin`. | Zero changes to internal links, `router.replace("/admin")`, and the proxy logic. Flattening is a later, optional refactor. |
| D11 | **Wedding app: EN/FR scaffold only.** No product features in this project. | User decision: wedding features will be designed later. |
| D12 | Branch: **`refactor/monorepo`**. Merge to `master` only at cutover. | `master` stays deployable on Vercel the whole time. |

---

## 3. Target architecture

```text
repo/
├─ apps/
│  ├─ web/          @lili/web      lilispics.com            port 3050 (dev)
│  │  ├─ src/app/[locale]/…        public pages (unchanged URLs)
│  │  ├─ src/app/(rate)/…          QR rating flow
│  │  ├─ src/app/api/              PUBLIC routes only: contact POST, ratings POST,
│  │  │                            link click beacons, revalidate webhook
│  │  ├─ src/{components,sections,data,i18n,lib,types,proxy.ts}
│  │  ├─ messages/{en,fr}.json
│  │  ├─ public/
│  │  └─ scripts/seed.ts
│  ├─ admin/        @lili/admin    admin.lilispics.com      port 3051 (dev)
│  │  ├─ src/app/{layout.tsx, login/, admin/}
│  │  ├─ src/app/api/              ALL authenticated CMS routes (+ public GET projects/tags, as today)
│  │  ├─ src/components/admin/…    (same internal paths as today)
│  │  ├─ src/lib/{admin/sections.tsx, translate/use-translate.ts, fonts.ts}
│  │  └─ src/proxy.ts              Supabase session guard only
│  └─ wedding/      @lili/wedding  wedding.lilispics.com    port 3052 (dev)
│     └─ EN/FR next-intl scaffold, placeholder home, noindex
├─ packages/
│  ├─ config/       @lili/config   tsconfig bases
│  ├─ core/         @lili/core     env, supabase clients, api envelope/validate/withAuth/client,
│  │                               zod schemas, types/db, i18n routing, data layer, mail,
│  │                               translate (server), rating, slugify, links constants,
│  │                               revalidation, ALL route-handler logic (handlers/*)
│  └─ ui/           @lili/ui       shared presentational components, motion presets,
│                                  bento + media-query hooks, link/social icons,
│                                  Tailwind theme tokens + base CSS
├─ supabase/migrations/            unchanged, shared
├─ docs/                           handbook (updated per phase)
├─ package.json                    private root: workspaces, turbo scripts, packageManager
├─ turbo.json
├─ biome.json                      single root config for the whole repo
└─ bun.lock                        single lockfile
```

### Dependency direction (enforced)

```text
apps/*  ──►  @lili/ui  ──►  @lili/core
   └────────────────────►  @lili/core
all ──► @lili/config (dev only: tsconfig)
```

- `@lili/core` must never import from `@lili/ui` or from any app.
- `@lili/ui` must never import from any app.
- Apps never import from another app.
- Packages never use the `@/` alias. It always means "the current app's
  `src/`", and inside a transpiled package it would silently resolve against
  whichever app is compiling it. Inside a package, use **relative imports**
  for same-package modules and `@lili/<pkg>/<subpath>` for other packages.

### Why `db` and `core` are one package

`types/db.ts` imports `Locale` (i18n) and the link icon-key constants, and the
API schemas import those constants too. Splitting "db" from "core" would create
a package cycle. One `@lili/core` with granular subpath exports gives the same
isolation without the cycle.

---

## 4. Naming, ports, environment variables

### Workspace package names

| Path | `name` |
| --- | --- |
| `apps/web` | `@lili/web` |
| `apps/admin` | `@lili/admin` |
| `apps/wedding` | `@lili/wedding` |
| `packages/config` | `@lili/config` |
| `packages/core` | `@lili/core` |
| `packages/ui` | `@lili/ui` |

### Dev ports

`web` 3050 (unchanged), `admin` 3051, `wedding` 3052.

### Environment variables (final state)

Each app has its own `.env.local` (git-ignored) and `.env.example` (committed),
inside the app folder. Next.js loads env files from the app directory, not
the repo root.

| Variable | web | admin | wedding | Build-time? | Notes |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | ✅ | ✅ | **yes** (inlined) | Also used by `next.config.ts` for image host |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | ✅ | ✅ | **yes** | |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | ✅ | ✅ | ✅ | **yes** | default `photos` |
| `NEXT_PUBLIC_SITE_URL` | ✅ `https://lilispics.com` | ✅ `https://admin.lilispics.com` | ✅ `https://wedding.lilispics.com` | **yes** | Each app's own canonical origin |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | ✅ | (later) | runtime only | server secret, never a build arg |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | ✅ | — | (later) | runtime | contact notifications (public POST lives in web) |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | — | ✅ | — | runtime | translation is admin-only |
| `PORTFOLIO_URL` | — | ✅ | — | runtime | Origin of the web app. Used for QR rating URLs and the revalidation webhook. Added in phase 05. |
| `REVALIDATE_SECRET` | ✅ | ✅ | — | runtime | Same random value in web and admin. Added in phase 05. |
| `ADMIN_URL` | ✅ | — | — | **yes** | Used by web's `next.config.ts` redirects `/admin*`, `/login` → admin origin. Added in phase 05. |

> Agents must **never** read, print, or modify any `.env.local`. When a phase
> needs new variables, the agent updates the matching `.env.example` and asks
> the operator to fill in `.env.local`.

---

## 5. Golden rules for the executing agent

1. **Follow `AGENTS.md`** (Next 16 docs under `node_modules/next/dist/docs/`,
   Biome, no dependency upgrades, API envelope, security). Where `AGENTS.md`
   names a path that this migration has moved, the phase file wins for paths.
   Phase 09 rewrites `AGENTS.md` for the final layout.
2. **Use `git mv` for every move** so history follows the files. Never
   "delete and recreate" a moved file. Move first, then edit, so each file's
   rename and edits are distinguishable.
3. **No dependency upgrades.** When a dependency moves between `package.json`
   files, copy its **exact current version range**. After every `bun install`,
   run `git diff bun.lock` and confirm that no already-installed package
   changed its resolved version (see §7.3). The only new dependency in the
   whole project is `turbo` (approved).
4. **No `@/` imports inside `packages/`.** Verify with
   `git grep -n '"@/' -- packages/` → must print nothing.
5. **No barrel `index.ts` in packages.** Import precise subpaths.
6. **Route segment config stays in the app's route file.** Next statically
   reads exports like `runtime`, `dynamic` and `maxDuration`, and they cannot
   be re-exported from a package. None exist today; if you add one, put it in
   the app file.
7. **Route shims use `export const METHOD = importedHandler;`** Do not use
   `export { x as GET } from "…"` re-export syntax.
8. **Keep behavior identical** unless the phase explicitly changes it. That
   covers URLs, response envelopes, status codes, auth semantics, cache tags,
   and copy.
9. **Animation stays `motion/react`.** Do not introduce CSS keyframes or
   Tailwind `transition-*` utilities (user rule).
10. **Neutral colors stay true-neutral.** Do not touch `theme.css` values while
    moving it.
11. **Secrets:** never read `.env.local`, never put secrets in Dockerfiles,
    build args, logs, docs, or commits. `SUPABASE_SERVICE_ROLE_KEY`,
    `OPENROUTER_API_KEY`, `RESEND_API_KEY` and `REVALIDATE_SECRET` are runtime-only.
12. **Migrations:** this project adds **no** SQL migration. Never run
    `bun run seed --force`.
13. **Line endings:** the repo stores LF. `core.autocrlf=true` on this Windows
    machine can leave working-copy files as CRLF, which makes `biome check`
    report one `format` error per file even though committed content is fine.
    Before treating a lint failure as real, run `git ls-files --eol <file>`.
    `i/lf w/crlf` means a checkout artifact. Never mass-reformat unrelated
    files. Files you write yourself should be LF.
14. **Commits:** **the agent never commits.** Stage nothing on its own
    initiative either; the operator reviews and commits. Ignore any "Commit"
    step in a phase file: replace it with the suggested message below. Work
    stays on `refactor/monorepo` only. Never push, rebase, amend, or force
    anything.

    **At the end of every phase, always suggest a commit message** in the
    phase report (§9) and nothing more. Style: a one-line headline (imperative, sentence case), a
    blank line, then a body made of bullet points starting with `- `, one per
    notable change, then the `Co-Authored-By` trailer (end every suggested
    message with it). Example:

    ```text
    Move the app into apps/web behind Bun workspaces and Turborepo

    - Move src, public, messages, scripts and configs into apps/web
    - Add the root workspace package.json and turbo.json
    - Pin turbo 2.11.10 and update bun.lock
    - Update .gitignore and biome.json for nested apps
    - Refresh the local-development docs and add the migration banners

    Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
    ```
15. **Shell:** the user's terminal is PowerShell on Windows. When you hand the
    user a command, give PowerShell syntax and the directory to run it in. If
    you run commands yourself through a Bash tool, POSIX syntax is fine.

---

## 6. Phase list

| Phase | File | Goal | Touches production? |
| --- | --- | --- | --- |
| 01 | [`01-workspace-and-turborepo.md`](01-workspace-and-turborepo.md) | Move the app to `apps/web`, Bun workspaces, Turborepo, root scripts | No |
| 02 | [`02-config-and-core-package.md`](02-config-and-core-package.md) | `@lili/config` tsconfig bases; extract `@lili/core` (non-UI shared logic) | No |
| 03 | [`03-route-handlers-into-core.md`](03-route-handlers-into-core.md) | Move all API route logic into `@lili/core/handlers/*`; routes become shims | No |
| 04 | [`04-ui-package-and-styles.md`](04-ui-package-and-styles.md) | Extract `@lili/ui` (shared components, hooks, icons, CSS tokens) | No |
| 05 | [`05-admin-app.md`](05-admin-app.md) | Create `apps/admin`, move CMS UI and routes, cross-app revalidation, redirects | No |
| 06 | [`06-docker-images.md`](06-docker-images.md) | Standalone output, Dockerfiles, lazy secret checks, proxy-safe origin check | No |
| 07 | [`07-dokploy-deploy-and-cutover.md`](07-dokploy-deploy-and-cutover.md) | Staging on Dokploy, then production cutover from Vercel | **Yes** (🧑 operator-led) |
| 08 | [`08-wedding-app-scaffold.md`](08-wedding-app-scaffold.md) | `apps/wedding` EN/FR scaffold + Dokploy app | Adds a subdomain |
| 09 | [`09-documentation-and-agents.md`](09-documentation-and-agents.md) | Final docs/AGENTS/README pass for the monorepo | No |
| — | [`99-future-self-hosted-supabase.md`](99-future-self-hosted-supabase.md) | Assessment only. **Not scheduled; do not execute.** | — |

Phases 01–06 are pure code and can be verified locally. Phase 07 is driven by
the operator, with the agent assisting. Phase 08 can run before phase 07 if the
operator wants the wedding staging URL early, but its Dokploy section needs
phase 07 §A–B (GitHub connection and the Dokploy project) done first.

---

## 7. Verification protocol (every phase)

### 7.1 Standard checks

Run from the **repo root** (after phase 01 these are Turbo-driven):

```powershell
bun install
bun run lint        # biome check over the whole repo
bun run typecheck   # turbo run typecheck (every workspace)
bun run build       # turbo run build (every app)
```

Before phase 01 completes, the old single-app scripts apply.

### 7.2 Runtime smoke test (when the phase says so)

The operator (or the agent, if authorized) starts the relevant dev servers
and checks the listed URLs. The phase file says which ones. Agents cannot log
in to the admin: login checks are operator-only (🧑).

### 7.3 Lockfile guard

Before the phase's first `bun install`, snapshot resolved versions:

```powershell
bun pm ls --all > "$env:TEMP\lili-deps-before.txt"
```

After it:

```powershell
bun pm ls --all > "$env:TEMP\lili-deps-after.txt"
git diff --no-index --stat "$env:TEMP\lili-deps-before.txt" "$env:TEMP\lili-deps-after.txt"
```

Expected differences are limited to:

- workspace entries (`@lili/*`)
- the tree shape (packages now listed under different workspaces)
- `turbo` in phase 01

If a third-party package's **version** changed, pin the original version in
the relevant `package.json` (exact version) and reinstall. If that's not
possible, STOP and report.

If `bun pm ls --all` is unavailable in this Bun version, use `bun pm ls`
instead, and inspect `git diff bun.lock` for changed `"name@version"` strings.

### 7.4 Structural greps (from phase 02 on)

```bash
git grep -n '"@/' -- packages/          # must be empty
git grep -n "from \"@lili/ui" -- packages/core/   # must be empty
git grep -nE "from \"\.\./\.\./\.\./apps" -- packages/   # must be empty
```

---

## 8. Branch and merge strategy

- All work happens on `refactor/monorepo`, cut from `master` at `9181ba6`.
- `master` may receive hotfixes during the migration (e.g. copy tweaks). Before
  starting each phase, the agent checks
  `git log --oneline refactor/monorepo..master`. If it prints commits, STOP
  and ask the operator whether to merge `master` into the branch first. Git's
  rename detection usually maps `src/x` → `apps/web/src/x` automatically. If a
  conflict appears in a moved file, apply the master change to the new path.
- **Do not merge the branch into `master` before phase 07 §C.** Vercel builds
  `master` from the repo root and would fail on the monorepo layout. Phase 07
  disables Vercel's Git auto-deploy before the merge.

---

## 9. Phase report template

At the end of each phase the agent replies with:

```markdown
## Phase 0X report

**Status:** done | blocked (reason)
**Commits:** none (the operator commits)

### Suggested commit message
```text
<Headline: imperative, sentence case>

- <bullet per notable change>
- …

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

### What changed
- …

### Deviations from the plan
- None | <what, why>

### Verification
- bun install: ok | <issue>
- lockfile guard: no third-party version changes | <list>
- lint: ok | <only CRLF checkout artifacts: list> | <real errors>
- typecheck: ok
- build: ok (<apps>)
- structural greps: ok
- smoke test: <done by agent / needs operator: list of URLs>

### Operator actions needed (🧑)
- …

### Notes for the next phase
- …
```

---

## 10. Known pitfalls (read before every phase)

| Pitfall | Where it bites | Mitigation (phase) |
| --- | --- | --- |
| `@/` alias inside a package resolves against the compiling app | 02, 04 | Relative imports inside packages; grep guard §7.4 |
| A barrel file pulls `server-only` code into a client bundle → build error "You're importing a component that needs server-only" | 02–05 | No barrels; precise subpaths |
| Tailwind 4 does not scan `packages/ui` → classes used only in shared components disappear | 04 | `@source` directive in each app's `globals.css` |
| `NEXT_PUBLIC_*` values are inlined at **build** time | 06, 07 | Docker build args for `NEXT_PUBLIC_*` (and `ADMIN_URL`) only |
| Service-role key required at build because of the module-level `throw` | 06 | Make the check lazy (inside the factory) |
| Turbo strict env mode hides env vars from tasks | 01, 06 | `env`/`passThroughEnv` in `turbo.json`; Dockerfiles call `next build` directly, not through Turbo |
| `revalidateTag` in admin cannot bust web's cache | 05 | `/api/revalidate` webhook on web, called by admin |
| QR rating URLs would point at the admin origin | 05 | `PORTFOLIO_URL` in admin |
| Old bookmarks `lilispics.com/admin`, `/login` | 05 | Redirects in web `next.config.ts` |
| `request.url` origin behind Traefik differs from the browser `Origin` | 06 | Use the forwarded-header-aware same-origin helper |
| Next standalone in a monorepo nests the server at `.next/standalone/apps/<app>/server.js` and does not copy `public`/`.next/static` | 06 | Dockerfile copies both into the nested path |
| Docker builder without Node: Bun's node shim runs `next build` under Bun | 06 | Builder image is `node:24` with the Bun binary copied in |
| Domain DNS might be hosted **on Vercel** (Vercel nameservers). Leaving Vercel then means moving the DNS zone, including MX/Resend/DKIM records. | 07 | Inventory DNS before the cutover |
| Staging on Dokploy shares the **production** Supabase project | 07 | Staging write-tests are limited, labeled, and cleaned up |
| Vercel builds `master` from repo root and fails after the merge | 07 | Disconnect Vercel Git auto-deploy before merging |
| `bun.lock` re-resolution silently upgrades deps | 01–05 | Lockfile guard §7.3 |
