# Troubleshooting

## The app fails with a missing environment variable

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are read by shared environment code and are required by `apps/web` and `apps/admin`; they throw at import when missing.

`SUPABASE_SERVICE_ROLE_KEY` is different: it is read when a route actually uses the service-role client, not at startup or build time. A route that needs it returns an HTTP 500 and the server logs `Missing env var: SUPABASE_SERVICE_ROLE_KEY`, while the rest of the app keeps working. Set it in that app's runtime environment (admin writes, web contact/rating/click routes) and restart.

Compare variable names with the app's `.env.example`. Each app has its own `.env.local`: a variable set in `apps/web/.env.local` is invisible to the admin. Restart `bun run dev` after changing `.env.local`. Never print secret values while diagnosing.

## Local metadata points to port 3000

The development scripts run ports 3050 (web), 3051 (admin) and 3052 (wedding), but metadata/sitemap code falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset. Set it in **each app's** `.env.local`:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3050   # apps/web
NEXT_PUBLIC_SITE_URL=http://localhost:3051   # apps/admin
NEXT_PUBLIC_SITE_URL=http://localhost:3052   # apps/wedding
```

Production uses each app's own canonical HTTPS origin.

## Supabase images are rejected by Next Image

Each app's `next.config.ts` derives the allowed Storage hostname from `NEXT_PUBLIC_SUPABASE_URL` during the build. Confirm the URL existed at **build** time (in Docker, as a build argument) and redeploy after changing projects. Also verify `NEXT_PUBLIC_SUPABASE_BUCKET` and the public bucket policy.

Legacy Unsplash demo URLs require the existing `images.unsplash.com` remote pattern (web and admin).

## Admin redirects to login

- Confirm the user exists in Supabase Auth and the password is correct.
- Check that browser cookies are enabled.
- Ensure public URL/anon key values belong to the same project as the Auth user.
- Inspect the admin server logs for `auth.getUser()` failures.

The redirect is performed by `apps/admin/src/proxy.ts`. Mutation authorization is separately enforced by `withAuth`. Session cookies are host-only on the admin origin, so a login on `admin.lilispics.com` is not visible on `lilispics.com`.

## `/admin` on the portfolio redirects to localhost

The web app redirects `/admin*` and `/login` to `ADMIN_URL`, which is **compiled in at build time**. If it was missing from web's Docker build arguments, the redirect targets the local default `http://localhost:3051`. Add `ADMIN_URL` to web's Build-time Arguments and redeploy.

## API mutation returns 401

The request lacks a valid Supabase session cookie. Sign in through the admin's `/login` in the same browser origin. Do not solve this by exposing or sending the service-role key from the browser. A call to `https://lilispics.com/api/...` for an admin route will never work: those routes exist only on the admin origin.

## A route returns 404 or 405 on the wrong app

The API is split by app: public writes (`POST /api/contact`, `POST /api/ratings`, the click beacons, `POST /api/revalidate`) are served by web, and everything else (including `GET /api/projects` and `GET /api/tags`) by admin. Check [API reference](api-reference.md) for which origin serves a route.

## Link edits take minutes to appear on the public page

After a links save, the admin calls the web app's `POST /api/revalidate`. If that fails, the save still succeeds and the public cache catches up within its 300-second window. Check the admin logs for `[revalidate]` messages:

- `REVALIDATE_SECRET or PORTFOLIO_URL is not set`: set both in the admin's runtime environment.
- `responded 401`: `REVALIDATE_SECRET` differs between web and admin. It must be identical.
- `responded 503`: `REVALIDATE_SECRET` is missing in the web app.
- `failed: …`: `PORTFOLIO_URL` is wrong or the web app is unreachable from the admin container. It must be the public web origin.

## Click counts stop increasing

The click beacons only accept same-origin browser requests. Behind Traefik the Node server sees plain HTTP, so the check uses the `X-Forwarded-Proto` and `X-Forwarded-Host` headers. Look for HTTP 403 on `/api/links/*/click` in the web logs. Traefik forwards those headers by default; if a Cloudflare proxy sits in front, its SSL/TLS mode must be Full or Full (strict), never Flexible.

## Public reads fail but admin writes work

Apply all migrations and verify RLS public-read policies on projects, project photos, project tags, and tags. Check that the active schema is project-centric; the old `photos` table is dropped by migration 0003.

## Featured project fails with 409

Eight projects are already featured. Unfeature one before featuring another. If UI and database counts disagree, confirm migrations 0004–0007 are applied and inspect `projects.featured` directly.

## Upload is rejected

Supported MIME types are JPEG, PNG, WebP, and AVIF. The server limit is 4 MiB per image after browser compression; there is no photo-count limit per project.

The 4 MiB limit and the client's request splitting (see the comments in `ProjectForm.tsx`, `LinksEditor.tsx`, `packages/core/src/api/client.ts` and `api/schemas.ts`) were chosen for the previous host's 4.5 MB request-body cap. They are intentionally kept unchanged and can be relaxed in a future change now that the apps run on Dokploy.

If a batch receives HTTP 413 (from the host or a reverse proxy), use the form's sequential upload retry. If Storage fails, verify bucket name, service-role key, and Storage availability.

## Deleted project left an object in Storage

The database deletion completes before best-effort Storage cleanup. Look for a server log beginning with `[projects] failed to remove` in the admin logs and remove the confirmed orphan object manually from the configured bucket.

## Contact form succeeds but no email arrives

This is expected when Resend is unconfigured or rejects delivery: database persistence is the source of truth and email is best-effort. The contact route is served by the web app, so check the **web** environment.

1. Confirm a `contact_messages` row exists.
2. Check `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`.
3. Verify the sender domain in Resend.
4. Inspect the web server logs for `[contact] notification email failed`.

Do not expose contact rows publicly while debugging.

## Messages do not appear or unread count is wrong

Confirm migration 0009 added `contact_messages.read_at`. `GET /api/contact` requires an authenticated session on the admin origin. Opening a message writes a server timestamp; inspect the PATCH response and verify the service-role key if state does not persist.

## Rating QR is expired or already used

Rating tokens expire after 24 hours and are single-use. Generate a new QR in `/admin/ratings`. A submission receiving HTTP 410 `TOKEN_INVALID` must not retry with the same code.

If a fresh QR fails, confirm migration 0008 and the service-role key. If the QR URL points at the admin origin or at `localhost`, the admin's `PORTFOLIO_URL` is wrong or missing: it must be the public web origin, because `/rate/...` is served by the web app. The displayed page checks availability, while submission repeats the check atomically.

## Approved testimonial is not public

The rating needs a non-empty written note and `approved=true`. The testimonials section remains hidden until at least three qualifying ratings exist. Check locale expectations and the authenticated moderation response; do not weaken the approved-only RLS policy.

## Translation fails

- Confirm `OPENROUTER_API_KEY` is present in the **admin** server environment.
- Validate `OPENROUTER_MODEL` or remove it to use the default.
- Keep text at 2000 characters or fewer.
- Confirm source and target languages differ.
- Inspect the admin server logs for `[translate] OpenRouter request failed`.

Translation is available only to authenticated admin users.

## French route or copy is missing

French routes use the `/fr` prefix. Compare the complete key structure of the app's `messages/en.json` and `messages/fr.json` (`apps/web` or `apps/wedding`). For CMS projects, confirm the French fields or the expected fallback content exists.

## Tailwind classes missing from shared components

Classes used only inside `packages/ui` disappear when an app's Tailwind does not scan that package. Each app's `src/app/globals.css` must declare `@source "../../../../packages/ui/src"`, and shared components must live under `packages/ui/src`. A new app that skips this renders unstyled shared components.

## Build fails while loading fonts

Fonts are loaded through `next/font/google`. A restricted or offline build environment can prevent font retrieval, and the download also fails intermittently with `next/font/google queries have exactly one entry`. The Docker builds retry up to three times; for a local build, simply rerun it. Do not replace fonts or add CSS imports merely to bypass a temporary network failure.

## Docker build fails

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Killed with `exit code 137` | Out of memory during `next build` | Add swap on the server (a build needs roughly 2–3 GB), and deploy one app at a time |
| `lockfile had changes, but lockfile is frozen` | `bun.lock` was not committed after a dependency change | Run `bun install` locally, commit `bun.lock`, push |
| Build fails fetching data for `/links` | The build cannot reach Supabase, or `NEXT_PUBLIC_SUPABASE_*` build arguments are wrong | Check the build arguments and the server's outbound network |
| Pages work but images are broken | `NEXT_PUBLIC_SUPABASE_URL` was missing at build, so no image host is allowed | Add it to Build-time Arguments and redeploy |
| Certificate warning after a DNS change | Let's Encrypt is still issuing | Wait a few minutes and check the Traefik logs; make sure ports 80 and 443 are open |

## Lint reports formatting errors on files I did not change

The repository and Biome use LF line endings. With `core.autocrlf=true` on Windows many working files are CRLF, so `bun run lint` reports one `format` error per file even though git's content is fine. Run `git ls-files --eol <file>`: `i/lf w/crlf` means a checkout artifact. Do not mass-reformat unrelated files.

## Seed refuses to run

The seed requires both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (from `apps/web/.env.local`, so run it from `apps/web`) plus the explicit `--force` flag. This guard is intentional. Confirm the target is disposable before running:

```powershell
cd apps\web
bun run seed --force
```

## Still unresolved

Capture the failing route or command, the app and origin involved, HTTP status/error envelope, relevant server log (with secrets removed), environment variable **names** present, and the last applied migration. Then compare the behavior with [Architecture](architecture.md), [Database and storage](database-and-storage.md), and [API reference](api-reference.md).
