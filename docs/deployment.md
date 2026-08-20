# Vercel deployment

Vercel is the primary production target. This app requires a server runtime because it uses route handlers, Supabase sessions, protected mutations, dynamic database reads, and email/translation integrations. Do not deploy it as a static export.

## Before deploying

1. Create the production Supabase project.
2. Apply all migrations in numeric order.
3. Create the admin Auth user.
4. Confirm the `photos` Storage bucket and policies exist.
5. Configure a Resend verified domain if notification email is required.
6. Create an OpenRouter key if admin translation is required.
7. Decide the canonical production origin.

## Import into Vercel

Import `noah-blanchard/simple-lilis-pics` and use the repository root. Vercel detects Next.js and `bun.lock`. Keep the standard framework build command (`bun run build`) and output settings.

The application should be deployed as a Node-compatible Next.js server. No custom adapter or static export is configured.

## Production environment

Add these variables to the Vercel Production environment:

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Production server-only service-role key |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | `photos` unless intentionally renamed |
| `NEXT_PUBLIC_SITE_URL` | Full canonical origin, such as `https://lilispics.com` |
| `OPENROUTER_API_KEY` | Optional translation key |
| `OPENROUTER_MODEL` | Optional model override |
| `RESEND_API_KEY` | Optional notification key |
| `CONTACT_TO_EMAIL` | Inquiry recipient when email is enabled |
| `CONTACT_FROM_EMAIL` | Sender on a verified Resend domain |

Never prefix server secrets with `NEXT_PUBLIC_`. Use separate Supabase projects/keys for Preview deployments if previews may mutate content.

Environment changes that affect `NEXT_PUBLIC_SUPABASE_URL` or image configuration require a new build/deployment.

## Domain and external services

After attaching the custom domain:

- Set `NEXT_PUBLIC_SITE_URL` to its HTTPS origin without a trailing path.
- Redeploy so metadata and sitemap values use it.
- Ensure `CONTACT_FROM_EMAIL` belongs to a verified Resend domain.
- Confirm Supabase Auth settings allow the production site origin where applicable.

## Release procedure

1. Review pending migrations and apply them before code that depends on them.
2. Run locally:

   ```powershell
   bun run lint
   bun run typecheck
   bun run build
   ```

3. Push the intended commit to `master`.
4. Watch the Vercel build and function logs.
5. Complete the smoke tests below.

## Post-deploy smoke tests

- `/` and `/fr` render with the expected locale.
- `/portfolio` and `/fr/portfolio` load Supabase projects.
- A project detail page renders images and localized metadata.
- `/sitemap.xml` uses the production origin and includes locale alternates.
- Unauthenticated `/admin` redirects to `/login`.
- Admin login, project read, and sign-out work.
- Create/edit/delete operations work against the intended production database.
- A test image renders from the configured Storage hostname.
- A generated EN/FR rating QR opens a valid token page; one test submission appears in moderation and cannot be reused.
- Approving three written ratings exposes the localized testimonial section as expected.
- A contact message appears unread in `/admin/messages` and read state persists.
- Translation works when configured.
- A real contact submission creates a private row and, when configured, sends email.

## Rollback

Vercel can promote a previous deployment, but a code rollback does not roll back Supabase migrations or content mutations. Prefer backward-compatible migrations and take a database backup before destructive schema changes. Rotate a key immediately if it appears in logs, commits, or client output.
