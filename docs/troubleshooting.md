# Troubleshooting

## The app fails with a missing environment variable

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are read by shared environment code and are required. Server routes that mutate or store contact messages also need `SUPABASE_SERVICE_ROLE_KEY`.

Compare variable names with `.env.example`. Restart `bun run dev` after changing `.env.local`. Never print secret values while diagnosing.

## Local metadata points to port 3000

The development script runs port 3050, but metadata/sitemap code falls back to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset. Set:

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3050
```

Production must use the canonical HTTPS origin.

## Supabase images are rejected by Next Image

`next.config.ts` derives the allowed Storage hostname from `NEXT_PUBLIC_SUPABASE_URL` during the build. Confirm the URL existed at build time and redeploy after changing projects. Also verify `NEXT_PUBLIC_SUPABASE_BUCKET` and the public bucket policy.

Legacy Unsplash demo URLs require the existing `images.unsplash.com` remote pattern.

## Admin redirects to login

- Confirm the user exists in Supabase Auth and the password is correct.
- Check that browser cookies are enabled.
- Ensure public URL/anon key values belong to the same project as the Auth user.
- Inspect server logs for `auth.getUser()` failures.

The redirect is performed by `src/proxy.ts`. Mutation authorization is separately enforced by `withAuth`.

## API mutation returns 401

The request lacks a valid Supabase session cookie. Sign in through `/login` in the same browser origin. Do not solve this by exposing or sending the service-role key from the browser.

## Public reads fail but admin writes work

Apply all migrations and verify RLS public-read policies on projects, project photos, project tags, and tags. Check that the active schema is project-centric; the old `photos` table is dropped by migration 0003.

## Featured project fails with 409

Eight projects are already featured. Unfeature one before featuring another. If UI and database counts disagree, confirm migrations 0004–0007 are applied and inspect `projects.featured` directly.

## Upload is rejected

Supported MIME types are JPEG, PNG, WebP, and AVIF. The server limit is 5 MiB per image after browser compression and four photos per project.

If a batch receives HTTP 413 from the host, use the form's sequential upload retry. If Storage fails, verify bucket name, service-role key, and Storage availability.

## Deleted project left an object in Storage

The database deletion completes before best-effort Storage cleanup. Look for a server log beginning with `[projects] failed to remove` and remove the confirmed orphan object manually from the configured bucket.

## Contact form succeeds but no email arrives

This is expected when Resend is unconfigured or rejects delivery: database persistence is the source of truth and email is best-effort.

1. Confirm a `contact_messages` row exists.
2. Check `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL`.
3. Verify the sender domain in Resend.
4. Inspect server logs for `[contact] notification email failed`.

Do not expose contact rows publicly while debugging.

## Messages do not appear or unread count is wrong

Confirm migration 0009 added `contact_messages.read_at`. `GET /api/contact` requires an authenticated session. Opening a message writes a server timestamp; inspect the PATCH response and verify the service-role key if state does not persist.

## Rating QR is expired or already used

Rating tokens expire after 24 hours and are single-use. Generate a new QR in `/admin/ratings`. A submission receiving HTTP 410 `TOKEN_INVALID` must not retry with the same code.

If a fresh QR fails, confirm migration 0008, `NEXT_PUBLIC_SITE_URL`, and the production service-role key. The displayed page checks availability, while submission repeats the check atomically.

## Approved testimonial is not public

The rating needs a non-empty written note and `approved=true`. The testimonials section remains hidden until at least three qualifying ratings exist. Check locale expectations and the authenticated moderation response; do not weaken the approved-only RLS policy.

## Translation fails

- Confirm `OPENROUTER_API_KEY` is present in the server environment.
- Validate `OPENROUTER_MODEL` or remove it to use the default.
- Keep text at 2000 characters or fewer.
- Confirm source and target languages differ.
- Inspect server logs for `[translate] OpenRouter request failed`.

Translation is available only to authenticated admin users.

## French route or copy is missing

French routes use the `/fr` prefix. Compare the complete key structure of `messages/en.json` and `messages/fr.json`. For CMS projects, confirm the French fields or the expected fallback content exists.

## Build fails while loading fonts

Fonts are loaded through `next/font/google`. A restricted or offline build environment can prevent font retrieval when artifacts are not cached. Retry with network access appropriate for the build environment; do not replace fonts or add CSS imports merely to bypass a temporary network failure.

## Seed refuses to run

The seed requires both `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` plus the explicit `--force` flag. This guard is intentional. Confirm the target is disposable before running:

```powershell
bun run seed --force
```

## Still unresolved

Capture the failing route or command, HTTP status/error envelope, relevant server log (with secrets removed), environment variable **names** present, and the last applied migration. Then compare the behavior with [Architecture](architecture.md), [Database and storage](database-and-storage.md), and [API reference](api-reference.md).
