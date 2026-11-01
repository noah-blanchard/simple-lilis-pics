# Phase 06: Production Docker images (standalone output)

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Make `apps/web` and `apps/admin` build into small, secret-free Docker images
that Dokploy (phase 07) can run behind Traefik. That needs:

1. `output: "standalone"` in both Next configs.
2. **No server secret needed at build time.** Make the service-role check lazy.
3. A **reverse-proxy-safe same-origin check** for the link-click beacons.
4. One multi-stage `Dockerfile` per app (build context = repo root) and a root
   `.dockerignore`.
5. A local image test (operator, if Docker is installed).

## Preconditions

- [ ] Phase 05 is committed, and build passes from the root.
- [ ] Branch `refactor/monorepo`, clean tree, `master` not ahead (README §8).

## Out of scope

- Dokploy configuration, DNS, production (phase 07).
- The wedding app's Dockerfile (phase 08 copies the admin one).
- Shared/remote Next cache handlers. Single instance per app, so the local
  filesystem cache is fine (see "Caching and ISR" in the self-hosting guide).

---

## Step 1: Read the docs (AGENTS.md requirement)

Under `node_modules/next/dist/docs/01-app/`:

- `02-guides/self-hosting.md`: reverse proxy, env vars, caching, graceful
  shutdown.
- `03-api-reference/05-config/01-next-config-js/output.md`: standalone,
  monorepo tracing, copying `public` and `.next/static`.

Facts this plan relies on (verified in the installed `next/dist/server/config.js`):

- When neither `outputFileTracingRoot` nor `turbopack.root` is set, Next 16
  infers the workspace root from the lockfile (`bun.lock` at the repo root) and
  sets **both** to it. So **do not set `outputFileTracingRoot` manually**.
- With a repo-root tracing root, standalone output mirrors the repo layout:
  `apps/web/.next/standalone/apps/web/server.js`, with the traced
  `node_modules` at `apps/web/.next/standalone/node_modules`.
- `server.js` doesn't serve `public/` or `.next/static/` unless they are
  copied next to it.

## Step 2: Lazy service-role check

`packages/core/src/supabase/admin.ts` currently throws at **module load** when
`SUPABASE_SERVICE_ROLE_KEY` is missing. `next build` imports every route
module, so the secret would be required at build time. That would force it
into a Docker build arg, which leaks into image metadata. **Not acceptable.**

Replace the file's body with:

```ts
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "../env";

/** Service-role Supabase client. Bypasses RLS — use ONLY inside route handlers
 *  on the server, never in client code. Auth is enforced by `withAuth` before
 *  this client touches the database or storage.
 *
 *  The key is read per call rather than at module load: `next build` imports
 *  every route module, and the service-role key is a runtime-only secret that
 *  must never be a Docker build argument. */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
```

Check that nothing else reads server secrets at module scope:

```bash
git grep -nE "process\.env\.(SUPABASE_SERVICE_ROLE_KEY|OPENROUTER_API_KEY|RESEND_API_KEY|REVALIDATE_SECRET|CONTACT_)" -- packages apps
```

Every hit must be **inside a function body**. As of phase 05 that holds for
`mail/resend.ts`, `translate/openrouter.ts`, `revalidate.ts` and
`handlers/revalidate.ts`. `apps/web/scripts/seed.ts` is a CLI script and is
exempt. If a module-scope read shows up, apply the same lazy pattern and
report it.

## Step 3: Same-origin check that works behind Traefik

The two click handlers (`packages/core/src/handlers/link-click.ts` and
`social-link-click.ts`) do:

```ts
const origin = request.headers.get("origin");
const fetchSite = request.headers.get("sec-fetch-site");
if (origin !== new URL(request.url).origin || fetchSite === "cross-site") {
  return apiError("FORBIDDEN", "Same-origin request required", 403);
}
```

Behind a TLS-terminating proxy, the Node server receives plain HTTP, so
`request.url` may start with `http://` while the browser's `Origin` is
`https://lilispics.com`. Every click beacon would then get a 403. The failure
is silent, because beacons ignore responses, and click stats would just stop.

New file `packages/core/src/api/same-origin.ts`:

```ts
/** Origin the browser used to reach this server. Behind a TLS-terminating
 *  reverse proxy (Traefik on Dokploy) `request.url` can carry the internal
 *  scheme/host, so prefer the standard forwarded headers when present. */
export function publicRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(/:$/, "");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;
  return `${proto}://${host}`;
}

/** Browser same-origin guard for best-effort public beacons. Not an auth
 *  boundary — it only stops other sites from inflating click counts. */
export function isSameOriginRequest(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return (
    origin === new URL(request.url).origin ||
    origin === publicRequestOrigin(request)
  );
}
```

In both click handlers:

- add `import { isSameOriginRequest } from "../api/same-origin";`
- replace the three lines above (the two `const`s and the `if`) with:

  ```ts
  if (!isSameOriginRequest(request)) {
    return apiError("FORBIDDEN", "Same-origin request required", 403);
  }
  ```

Behavior is unchanged when there is no proxy: a missing `Origin` header is
still 403, and `cross-site` is still 403. Behind a proxy, the forwarded origin
is also accepted.

## Step 4: Standalone output

In **both** `apps/web/next.config.ts` and `apps/admin/next.config.ts`, add
`output: "standalone",` as the first property of the config object. Leave
everything else as it is.

Run `bun run build`, then check:

```bash
ls apps/web/.next/standalone/apps/web/server.js
ls apps/admin/.next/standalone/apps/admin/server.js
ls apps/web/.next/standalone/node_modules/next/package.json
```

**Windows caveat:** the standalone copy step can fail on Windows with
`EPERM`/symlink errors (workspace packages are symlinked in `node_modules`).
If that happens, don't fight it locally. Make the option env-gated in **both**
configs, so only Docker builds produce standalone output, and report it:

```ts
output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
```

…and add `NEXT_OUTPUT=standalone` to the builder stage `ENV` in both
Dockerfiles (step 6). Also add `"NEXT_OUTPUT"` to the `env` array of the
`build` task in `turbo.json`.

## Step 5: Root `.dockerignore`

The build context is the repo root, so this file controls what enters every
image build. It must **exclude every env file** so secrets never reach an
image layer.

```gitignore
# VCS / tooling
.git
.github
.vercel
**/.turbo
**/*.tsbuildinfo

# dependencies and build output (rebuilt inside the image)
**/node_modules
**/.next
**/out
**/build
**/dist
**/next-env.d.ts

# secrets: NEVER send env files to the Docker daemon
**/.env
**/.env.*
!**/.env.example

# not needed to build
docs
supabase
**/*.md
!**/README.md
```

## Step 6: Dockerfiles

### `apps/web/Dockerfile`

```dockerfile
# syntax=docker/dockerfile:1
#
# Lilis Pics — public portfolio (apps/web).
# Build context MUST be the repository root:
#   docker build -f apps/web/Dockerfile -t lili-web .
#
# NEXT_PUBLIC_* and ADMIN_URL are inlined into the build, so they are build
# args. Server secrets (SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY,
# REVALIDATE_SECRET, …) are runtime env only — never pass them as build args.

ARG NODE_VERSION=24
ARG BUN_VERSION=1.3.13

FROM oven/bun:${BUN_VERSION} AS bun

# ── Build ───────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS builder
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app

COPY . .
RUN --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SUPABASE_BUCKET=photos
ARG NEXT_PUBLIC_SITE_URL
ARG ADMIN_URL
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL} \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY} \
    NEXT_PUBLIC_SUPABASE_BUCKET=${NEXT_PUBLIC_SUPABASE_BUCKET} \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    ADMIN_URL=${ADMIN_URL} \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/apps/web
RUN bun run build

# ── Runtime ─────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/favicon.ico').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/web/server.js"]
```

### `apps/admin/Dockerfile`

Identical structure, with these differences:

- header comment: `Lilis Pics — admin CMS (apps/admin)` and
  `docker build -f apps/admin/Dockerfile -t lili-admin .`
- the secrets list in the header: `SUPABASE_SERVICE_ROLE_KEY,
  OPENROUTER_API_KEY, REVALIDATE_SECRET, …`
- **no** `ADMIN_URL` build arg or `ENV` entry
- `WORKDIR /app/apps/admin` in the builder
- every `apps/web` path in the runner → `apps/admin`
- `CMD ["node", "apps/admin/server.js"]`

Notes for the agent:

- **Why the builder is `node`, not `oven/bun`:** `next build` should run on
  Node (the production runtime). In an image without Node, Bun shims `node`
  and runs Next under Bun. The Bun binary is copied in only for
  `bun install` and `bun run`.
- **Why `COPY . .` before `bun install`:** `--frozen-lockfile` needs every
  workspace's `package.json` to match `bun.lock`. Copying all manifests one by
  one would break whenever a workspace is added (phase 08). The BuildKit cache
  mount keeps reinstalls fast.
- `sharp` (used by `next/image` in production) ships prebuilt
  `@img/sharp-linux-*` packages that Bun installs for the build platform. Both
  stages are Debian bookworm (glibc), so the binaries match.
- `HOSTNAME=0.0.0.0` is required, or the standalone server listens only on
  the container's loopback.
- The healthcheck hits `/favicon.ico` (a static metadata route) so it never
  touches Supabase.

## Step 7: Verify

```bash
bun run lint
bun run typecheck
bun run build
git grep -n "SUPABASE_SERVICE_ROLE_KEY" -- apps/web/Dockerfile apps/admin/Dockerfile   # empty
```

### 🧑 Local image test (operator; skip if Docker isn't installed)

If Docker Desktop is not installed, write "skipped: no Docker" in the report.
Validation then happens on Dokploy staging in phase 07.

PowerShell, repo root. Fill the build args from `apps/web/.env.local` by
hand. The agent must not read that file.

```powershell
docker build -f apps/web/Dockerfile -t lili-web:local `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>" `
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3050" `
  --build-arg ADMIN_URL="http://localhost:3051" `
  .

docker build -f apps/admin/Dockerfile -t lili-admin:local `
  --build-arg NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" `
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon key>" `
  --build-arg NEXT_PUBLIC_SITE_URL="http://localhost:3051" `
  .

docker run --rm -d --name lili-web   -p 3050:3000 --env-file apps/web/.env.local   lili-web:local
docker run --rm -d --name lili-admin -p 3051:3000 --env-file apps/admin/.env.local lili-admin:local
```

`--env-file` takes `KEY=VALUE` lines literally. If a value in `.env.local` is
wrapped in quotes, Docker keeps the quotes. Remove them for this test if
needed.

Note: inside the admin container, `PORTFOLIO_URL=http://localhost:3050`
points at the admin container itself, so the revalidation call fails (logged,
non-fatal). That's expected locally. Revalidation is verified on staging.

Checks:

| Check | Expected |
| --- | --- |
| `docker inspect --format "{{.State.Health.Status}}" lili-web` (after ~30 s) | `healthy` |
| `http://localhost:3050/`, `/fr`, `/portfolio`, `/links` | render, images load |
| One Supabase image URL through `/_next/image?url=…&w=640&q=75` (copy one from the page's HTML) | 200, `content-type: image/webp` or similar (proves `sharp` works) |
| `curl -I http://localhost:3050/admin` | 307 → `http://localhost:3051/admin` |
| `http://localhost:3051/login` → log in → `/admin/projects` | loads |
| `docker history lili-web:local --no-trunc` and `docker history lili-admin:local --no-trunc` | No service-role, OpenRouter, Resend or revalidate secret values appear. (NEXT_PUBLIC values are expected; they're public.) |
| `docker image ls lili-web` | size reported (expect a few hundred MB). Record it. |

Then clean up: `docker stop lili-web lili-admin`.

## Step 8: Commit

```text
Build web and admin as standalone Docker images

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Definition of done

- [ ] `createSupabaseAdminClient` reads the key lazily, and no server secret is
      read at module scope.
- [ ] Click beacons use `isSameOriginRequest`.
- [ ] Both apps produce standalone output (or env-gated, with the reason
      reported).
- [ ] `.dockerignore`, `apps/web/Dockerfile` and `apps/admin/Dockerfile`
      exist as specified.
- [ ] Lint, typecheck and build pass. Local image test done or explicitly
      skipped.
- [ ] Commit made. Phase report delivered. STOP.
