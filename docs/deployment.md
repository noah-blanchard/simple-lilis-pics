# Deployment (Dokploy)

Production runs on a self-managed [Dokploy](https://dokploy.com/) server. Each app is one Dokploy **Application** built from its own `Dockerfile`, served by Traefik with Let's Encrypt certificates. The apps are stateless: all data lives in Supabase, which is hosted by Supabase and is not part of this deployment. (The site previously ran on Vercel; that hosting is retired and nothing here depends on it.)

## Architecture

| Application | Dockerfile | Domain | Container port |
| --- | --- | --- | --- |
| `web` | `apps/web/Dockerfile` | `lilispics.com`, `www.lilispics.com` | 3000 |
| `admin` | `apps/admin/Dockerfile` | `admin.lilispics.com` | 3000 |
| `wedding` | `apps/wedding/Dockerfile` | `wedding.lilispics.com` (when deployed) | 3000 |

- All applications live in one Dokploy project (`lilis-pics`), use the GitHub provider with repository `noah-blanchard/simple-lilis-pics`, the `master` branch, and **Build Type = Dockerfile**.
- The Docker context path is `.` (the repository root) for every app, because the images need the workspace packages. The Docker build stage is left empty (the final stage).
- Images are multi-stage: a Node 24 builder (with the Bun binary copied in for `bun install --frozen-lockfile`), then a slim non-root Node runner started with the Next.js standalone server. Each image has a `HEALTHCHECK` on `/favicon.ico`.
- The Dockerfiles retry `bun run build` up to three times, because `next/font/google` occasionally fails to download fonts at build time.
- Builds need outbound network access: to Google Fonts, and to the real Supabase project (the `/links` page is prerendered with a 5-minute revalidate window, so the build reads from Supabase). A wrong `NEXT_PUBLIC_SUPABASE_*` build argument fails the build.

### Watch paths

Autodeploy is on, and watch paths keep a push that touches one app from rebuilding the others:

| Application | Watch paths |
| --- | --- |
| `web` | `apps/web/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` |
| `admin` | `apps/admin/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` |
| `wedding` | `apps/wedding/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` |

A change under `packages/` or to the lockfile rebuilds every app, which is intended.

## DNS and TLS (Cloudflare)

DNS is hosted on Cloudflare. The production records point at the Dokploy server's public IPv4:

| Record | Type | Proxy |
| --- | --- | --- |
| `@` (`lilispics.com`) | A | DNS only (grey cloud) |
| `www` | CNAME → `lilispics.com` | DNS only |
| `admin` | A | DNS only |
| `wedding` (when deployed) | A | DNS only |

- Keep the records **DNS only** so Let's Encrypt can validate the hostnames directly through Traefik. If you ever turn the Cloudflare proxy back on, set SSL/TLS to **Full (strict)** and keep Automatic SSL/TLS mode off. **Never use Flexible**: it sends plain HTTP to Traefik, which causes redirect loops and makes every click beacon fail with 403.
- Create a new hostname's DNS record **before** anyone opens it, so no resolver caches a "does not exist" answer (the zone allows up to 30 minutes of negative caching, and some routers keep it longer).
- Do not touch the mail records: three MX records to `route1/2/3.mx.cloudflare.net`, the Cloudflare Email Routing DKIM TXT, the SPF TXT, and the Google verification TXT belong to Cloudflare Email Routing.
- `www` and the apex both serve the site directly; there is no redirect between them.

## Build arguments and runtime environment

`NEXT_PUBLIC_*` values and web's `ADMIN_URL` are inlined into the bundle during `next build`, so they must be set in Dokploy **Build-time Arguments**. Setting the same values in the runtime **Environment** too is harmless. **Server secrets go in the runtime Environment only, never in build arguments** (a build argument can leak into image metadata).

| Variable | web | admin | wedding | When | Production value |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | yes | yes | build (+ runtime) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | yes | yes | build (+ runtime) | Supabase anon key |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | yes | yes | yes | build (+ runtime) | `photos` |
| `NEXT_PUBLIC_SITE_URL` | yes | yes | yes | build (+ runtime) | `https://lilispics.com` / `https://admin.lilispics.com` / `https://wedding.lilispics.com` |
| `ADMIN_URL` | yes | – | – | build (+ runtime) | `https://admin.lilispics.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | yes | – | runtime only | secret |
| `RESEND_API_KEY` | yes | – | – | runtime only | secret |
| `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | yes | – | – | runtime only | inbox and a sender on a verified Resend domain |
| `OPENROUTER_API_KEY` | – | yes | – | runtime only | secret |
| `OPENROUTER_MODEL` | – | yes | – | runtime only | optional model override |
| `PORTFOLIO_URL` | – | yes | – | runtime only | `https://lilispics.com` |
| `REVALIDATE_SECRET` | yes | yes | – | runtime only | the **same** random secret in both apps |

Generate the shared secret once with `openssl rand -hex 32` (or `bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) and keep it in a password manager. The wedding app has no server secrets yet, and its Supabase variables are not used by the scaffold.

Changing any build-time value requires a rebuild (redeploy). Never prefix a server secret with `NEXT_PUBLIC_`.

## Before the first deployment

1. Create the production Supabase project, apply all migrations in numeric order, and create the admin Auth user.
2. Confirm the `photos` Storage bucket and policies exist.
3. Configure a Resend verified domain if notification email is required, and an OpenRouter key if translation is required.
4. Server capacity: a `next build` needs roughly 2–3 GB of RAM. With less than 4 GB, add swap before the first build, and build the apps one at a time. Keep at least 10 GB of free disk for images and build cache.
5. In Dokploy → Settings → Git → GitHub, install the Dokploy GitHub app with access to the repository.
6. In Supabase → Authentication → URL Configuration, set the Site URL to `https://admin.lilispics.com` and add `https://admin.lilispics.com/**` to the redirect URLs (only auth emails use them; email/password sign-in does not).

## Adding the wedding app

1. In Cloudflare, add an A record `wedding` to the Dokploy IP (DNS only).
2. In the `lilis-pics` project, create an Application `wedding` with the same settings as the others: `apps/wedding/Dockerfile`, context `.`, branch `master`, the watch paths above.
3. Build-time Arguments and Environment: `NEXT_PUBLIC_SITE_URL=https://wedding.lilispics.com` plus the three `NEXT_PUBLIC_SUPABASE_*` values.
4. Domain: `wedding.lilispics.com`, path `/`, port `3000`, HTTPS on, Let's Encrypt.
5. Deploy, then check `https://wedding.lilispics.com/` and `/fr` (200) and `/robots.txt` (`Disallow: /`).

## Release procedure

1. Apply any pending Supabase migrations **before** the code that depends on them. Migrations are manual and are not rolled back by redeploying.
2. Run locally from the repository root:

   ```powershell
   bun run lint
   bun run typecheck
   bun run build
   ```

3. Push the intended commit to `master`. Dokploy rebuilds the applications whose watch paths changed. Deploy `web` and `admin` one at a time when the server has little spare memory.
4. Watch the build logs: `bun install --frozen-lockfile` succeeds, `next build` passes (a logged `build attempt N failed` followed by success is the font retry), and the container becomes healthy.
5. Complete the smoke tests below.

## Post-deploy smoke tests

`web` (`https://lilispics.com`):

- `/` and `/fr` render with the expected locale, and `/portfolio` and a project page load images.
- `/links` and `/fr/links` render, and `/sitemap.xml` uses `https://lilispics.com`.
- `/admin`, `/admin/projects` and `/login` redirect (307) to the same paths on `https://admin.lilispics.com`.
- `http://` redirects to `https://`, and `www.lilispics.com` serves the site.
- `POST /api/revalidate` with no credentials returns 401 (not 503, which would mean the secret is missing).

`admin` (`https://admin.lilispics.com`):

- `/` redirects to `/admin`, and `/admin` without a session redirects to `/login`.
- Log in and open every section: hub, projects, featured, ratings, messages, links.
- **Revalidation:** edit and save a link in the Links editor, reload `https://lilispics.com/links` and confirm the change shows immediately, then revert it. The admin logs should show no `[revalidate]` error.
- **QR:** generate an English QR and confirm the URL starts with `https://lilispics.com/rate/en/`. Do not submit.
- **Click counts:** click a link card on the public `/links` page and confirm its count increases in the admin (proves the proxy-aware same-origin check).
- The translate button works, and a test photo (`TEST — delete me`) uploads and is deleted.
- A real contact submission arrives in `/admin/messages` (and by email when Resend is configured); delete it afterwards.

## Rollback

- Redeploy the previous commit in Dokploy (or revert on `master` and push). A code rollback does **not** roll back Supabase migrations or content mutations, so prefer backward-compatible migrations and take a database backup before destructive schema changes.
- Rotate a key immediately if it appears in logs, commits, or client output.

## Optional operational extras

These are not required and are not configured by default. Apply them if you need them and record the decision here:

- **Image cache persistence:** `next/image` caches optimized images in `/app/apps/web/.next/cache/images` inside the container, which is lost on every redeploy. Add a Dokploy volume mount at `/app/apps/web/.next/cache` for `web` (the `nextjs` user, uid 1001, must be able to write to it).
- **Zero-downtime deploys:** Dokploy runs applications as Docker Swarm services. With the image `HEALTHCHECK`, set the service update order to *start-first* in the application's Advanced/Swarm settings so the old container serves until the new one is healthy.
- **Monitoring:** add an uptime check for `https://lilispics.com/favicon.ico` and `https://admin.lilispics.com/favicon.ico`.
- **Backups:** the applications are stateless, so back up the Dokploy configuration itself and rely on Supabase for the data.
- **Staging:** if staging hostnames are attached to the same applications they use the **production** database, so every write is a real production write.

## Troubleshooting

Common failures (build killed with exit code 137, frozen-lockfile errors, missing build arguments, the revalidation webhook, click counts, certificate warnings) are covered in [Troubleshooting](troubleshooting.md).
