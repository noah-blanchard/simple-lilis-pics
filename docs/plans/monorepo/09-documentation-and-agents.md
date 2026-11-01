# Phase 09: Documentation, AGENTS.md and README for the monorepo

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Make every durable document describe the **final** state: three apps, three
packages, Turborepo, Dokploy. Remove the migration banners. After this phase,
a new contributor or agent should never need `docs/plans/monorepo/` to
understand the repo. Those plans become a historical record.

`AGENTS.md` §9 applies: `README.md` stays concise, details live in `docs/`,
link instead of duplicating, and describe the current state.

## Preconditions

- [ ] Phases 01–06 are committed. Phase 07 is done (production on Dokploy).
      If it is not done yet, write the deployment docs as "target" and say
      so in the report.
- [ ] Phase 08 is done or explicitly deferred. Document whichever is true.
- [ ] Branch: `master` (post-cutover) via a short-lived branch
      `docs/monorepo` → merge, or `refactor/monorepo` if still pre-cutover.
      Ask the operator.

## Out of scope

- Code changes. If you find a doc/code mismatch caused by code, report it.
  Don't fix code in this phase.

---

## Step 1: Gather facts from the code (not from memory or these plans)

Collect, and use as the source of truth:

```bash
cat package.json turbo.json
cat apps/*/package.json packages/*/package.json
ls apps/*/src/app apps/*/src/app/api -R | head -200
git grep -n "process.env\." -- apps packages | grep -v node_modules
cat apps/*/.env.example
git grep -nE "^export (const|async function) (GET|POST|PUT|PATCH|DELETE)" -- apps
ls supabase/migrations
```

## Step 2: Rewrite `AGENTS.md`

Keep its structure (sections 1–9) and its imperative tone. Remove the
migration banner. Required content changes:

**§1 Project context**: three apps, each with its domain and purpose
(`apps/web` lilispics.com, `apps/admin` admin.lilispics.com, `apps/wedding`
wedding.lilispics.com, a scaffold with no features yet). Shared packages
`@lili/core`, `@lili/ui`, `@lili/config`. One Supabase project. Hosting on
self-managed Dokploy.

**§2 Read before changing code**: unchanged in spirit. The Next docs path is
still `node_modules/next/dist/docs/` (hoisted at the repo root).

**§3 Installed stack and commands**: add Turborepo (exact version from the
root `package.json`), Docker/Dokploy. Command list from the **root**:
`bun install`, `bun run dev`, `bun run dev:web|dev:admin|dev:wedding`,
`bun run build`, `bun run typecheck`, `bun run lint`, `bun run fix`,
`bun run format`. Seed: `cd apps/web; bun run seed --force`, still flagged
destructive.

**§4 Architecture boundaries**: rewrite as rules:

- App-local code lives in `apps/<app>/src`, and `@/` means "this app's `src`".
- **Packages never use `@/`.** Inside a package, use relative imports.
  Across packages, use `@lili/<pkg>/<subpath>`.
- **No barrel files in packages.** Import precise subpaths. This keeps
  server-only modules out of client bundles.
- Dependency direction: apps → `@lili/ui` → `@lili/core`. Core never imports
  ui or apps. Apps never import each other.
- `@lili/core` holds env, Supabase clients, the API envelope/validate/withAuth/client,
  Zod schemas, `types/db`, i18n routing, the public data layer, mail,
  server-side translation, rating helpers, cache tags and revalidation, and
  **all route-handler logic** (`handlers/*`).
- Route files in apps are shims (`export const POST = handler;`). Route
  segment config stays in the app file.
- Admin owns every authenticated CMS route. Public apps expose only their
  public writes and `/api/revalidate`.
- Cross-app cache invalidation goes through `requestPublicRevalidation()`
  (core) → `POST /api/revalidate` on public apps. Never call `revalidateTag`
  from admin code expecting it to reach another app.
- Components stay presentational and prop-driven (`@lili/ui` and each app's
  `components/`). Data is fetched at server/page/section edges through
  `@lili/core/data/*`.
- TanStack Query is for admin API state.
- New shared code: put it in `@lili/core` if it is logic without React, or
  `@lili/ui` if it renders or uses hooks. Everything else stays app-local.

**§5 Next.js, styling, motion**: add that each app's `globals.css` imports
`@lili/ui/styles/theme.css` + `base.css` and declares
`@source "../../../../packages/ui/src"`, and that new shared components must
live under that path to be scanned. Keep the motion rules.

**§6 Content and i18n**: messages are per app (`apps/web/messages`,
`apps/wedding/messages`), and each app keeps its own EN/FR parity. Routing
config is shared (`@lili/core/i18n/routing`).

**§7 Data, auth, security**: add:

- Each app has its own `.env.local`/`.env.example`.
- `NEXT_PUBLIC_*` (and web's `ADMIN_URL`) are build-time args. Server secrets
  are runtime-only and never Docker build args.
- Server secrets must be read inside functions, never at module scope (so
  `next build` needs no secrets).
- `REVALIDATE_SECRET` must match between web and admin.
- Admin session cookies are host-only on `admin.lilispics.com`.

**§8 Change discipline**: unchanged, but verification commands now run from
the root through Turbo. Mention the lockfile guard idea (no silent upgrades
when moving dependencies).

**§9 Documentation maintenance**: unchanged. Add `docs/deployment.md` as the
Dokploy runbook.

Also review `CLAUDE.md` and `CODEX.md`. They should keep deferring to
`AGENTS.md`. Only fix statements that became false; keep them short.

## Step 3: Rewrite `README.md` (concise entry point)

Sections:

1. One-paragraph intro, now including the wedding site (scaffold) and the
   separate admin.
2. **Apps** table: app, path, domain, dev port, purpose.
3. **Packages** table: package, purpose, one line each.
4. Technology table: add Turborepo, Docker, Dokploy. Remove Vercel.
5. Architecture at a glance: an ASCII diagram of three apps → packages →
   Supabase, plus the admin → web revalidation webhook.
6. Quick start: clone, `bun install`, create each app's `.env.local` from its
   `.env.example`, apply migrations, create the admin user, `bun run dev`.
   Open URLs for 3050/3051/3052.
7. Routes, **grouped by app**, with the same level of detail as today's table,
   plus `/api/revalidate` on web.
8. Scripts table (root scripts), plus the seed note.
9. Repository map (new tree).
10. Documentation links (deployment renamed to "Deployment (Dokploy)").

Remove the migration banner. Keep it concise; detail lives in `docs/`.

## Step 4: Update `docs/`

| Document | Required updates |
| --- | --- |
| `docs/README.md` | Index entries and reading paths. Rename "Vercel deployment" → "Deployment (Dokploy)". Add a line pointing to `docs/plans/monorepo/` as the historical migration record. |
| `docs/architecture.md` | Rewrite the system overview for 3 apps + packages. Request-flow diagrams per app. Route organization per app. Package boundaries (summarize AGENTS §4 and link to it). The revalidation webhook flow. Auth: the proxy lives only in admin. Integrations: which app uses OpenRouter (admin) and Resend (web). |
| `docs/api-reference.md` | For every route: **which app serves it** and its base URL (`https://lilispics.com` or `https://admin.lilispics.com`). Add `POST /api/revalidate` (auth: `Authorization: Bearer <REVALIDATE_SECRET>`, body `{ "tags": ["public-links"] }`, responses 200/400/401/422/503). Note that `GET /api/projects` and `GET /api/tags` are served by admin only. Same-origin rule for the click beacons (forwarded-header aware). |
| `docs/admin-guide.md` | The admin URL is `https://admin.lilispics.com` (login at `/login`). Old `lilispics.com/admin` links redirect. Link edits appear on the public site immediately via revalidation. |
| `docs/content-and-i18n.md` | Message file paths per app. Routing shared from core. The wedding app has its own messages (placeholder) and is noindex until launch. |
| `docs/database-and-storage.md` | Fix any `src/...` paths (e.g. to `packages/core/src/...`). Schema is unchanged. Migrations are still manual. |
| `docs/deployment.md` | **Rewrite as the Dokploy runbook**: architecture (one Dokploy Application per app, Dockerfile builds, context = repo root, Traefik/Let's Encrypt). A per-app table of build args vs runtime env (README §4 of the plans). Watch paths. Release procedure (migrations first → push `master` → watch builds → smoke tests). The smoke-test list. Rollback (redeploy the previous image/commit in Dokploy; DB migrations don't roll back). Image cache volume and zero-downtime notes, if the operator applied them. No Vercel content except one historical line. |
| `docs/local-development.md` | Complete monorepo setup: prerequisites, `bun install` at the root, per-app env files and the variable table (by app), migrations, admin user, dev commands and ports, seed from `apps/web`. |
| `docs/troubleshooting.md` | Update "missing environment variable" (the service-role key is now checked at call time and reported as a 500 from the route). Per-app `NEXT_PUBLIC_SITE_URL`. Add: link edits slow to appear (revalidation), click counts stuck (same-origin behind proxy), `/admin` on web redirects to localhost (`ADMIN_URL` missing at build), Docker build OOM, frozen-lockfile failure, Tailwind classes missing from shared components (`@source`). Upload size: the client still compresses to the old Vercel limits (comments in `ProjectForm.tsx`, `LinksEditor.tsx` and `api/schemas.ts`). Those limits are intentionally kept and can be relaxed in a future change. |

Mark the plans as historical. At the top of `docs/plans/monorepo/README.md`,
under the title, add:

```markdown
> **Status: completed (<YYYY-MM-DD>).** This folder is the historical record of
> the migration. Current documentation lives in `AGENTS.md`, `README.md`, and
> `docs/`.
```

(Use the actual completion date; ask the operator if unsure.)

## Step 5: Validate the documentation

1. Relative links resolve (run from the repo root):

   ```bash
   bun -e '
   const fs=require("fs"),path=require("path"),{execSync}=require("child_process");
   const files=execSync("git ls-files \"*.md\"").toString().trim().split("\n");
   let bad=0;
   for(const f of files){const t=fs.readFileSync(f,"utf8");
     for(const m of t.matchAll(/\]\(([^)\s]+)\)/g)){let u=m[1];
       if(/^(https?:|mailto:|#)/.test(u))continue;u=u.split("#")[0];if(!u)continue;
       if(!fs.existsSync(path.join(path.dirname(f),decodeURI(u)))){console.log(f+": "+m[1]);bad++;}}}
   console.log(bad?bad+" broken link(s)":"links ok");'
   ```

2. Every environment variable named in the docs exists in code or an
   `.env.example`, and vice versa:

   ```bash
   git grep -ohE "process\.env\.[A-Z_]+" -- apps packages | sort -u
   git grep -ohE "^[A-Z_]+=" -- "apps/*/.env.example" | sort -u
   ```

3. Every command in the docs exists as a script in a `package.json`.
4. Every path in the docs exists (spot-check each code path mentioned).
5. `git diff --check` is clean.
6. `bun run lint` (Biome also formats JSON; Markdown is not checked).

## Step 6: Commit

```text
Document the monorepo, admin app and Dokploy deployment

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Definition of done

- [ ] `AGENTS.md`, `README.md` and every file in `docs/` describe the final
      state, with no migration banners and no stale `src/...` root paths.
- [ ] The plans folder is marked historical.
- [ ] Link, env, command and path validation is clean, and `git diff --check`
      is clean.
- [ ] Commit made. Phase report delivered. STOP.
