# Phase 07: Dokploy staging, then production cutover

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Nature of this phase

This phase is **operator-led** (🧑). Most steps happen in the Dokploy UI, the
DNS provider, Vercel and Supabase, which the agent cannot access. The agent's
role:

- walk the operator through each step, one section at a time
- prepare exact values (env blocks, build args, watch paths)
- run read-only verification (`curl`, `nslookup`) when authorized
- record outcomes in the report

The agent never handles secret values. Wherever a secret is needed, it writes
`<from password manager>` and the operator fills it in.

**Important property of this migration:** the database does not move. Vercel
and Dokploy talk to the **same** Supabase project, so there is no data
migration and no write freeze. The production cutover is a DNS switch, and
rollback is a DNS switch back.

Dokploy UI labels below match recent Dokploy versions. If a label differs
slightly in the operator's version, map it by meaning and note the difference
in the report.

## Preconditions

- [ ] Phases 01–06 are committed on `refactor/monorepo`, and the branch is
      pushed: `git push -u origin refactor/monorepo` (🧑 or agent if
      authorized).
- [ ] The Dokploy instance is running and reachable, with its own admin
      dashboard on HTTPS.
- [ ] The operator knows the Dokploy server's public IPv4 (and IPv6, if any).

---

## Section A: Inventory and preparation (do this days before the cutover)

### A1. 🧑 Where is DNS hosted?

```powershell
nslookup -type=NS lilispics.com
```

- If the nameservers are `ns1.vercel-dns.com` / `ns2.vercel-dns.com`, **DNS
  is hosted on Vercel**. Leaving Vercel then also means moving the DNS zone.
  Before anything else:
  1. In Vercel → Domains → `lilispics.com` → DNS records, export or screenshot
     **every** record: MX (mail for `hello@lilispics.com`!), TXT (SPF,
     DMARC, verification), CNAME/TXT for Resend DKIM (`resend._domainkey`
     etc.), and any others.
  2. Create the zone at the new DNS provider (e.g. the registrar's DNS, or
     Cloudflare with **DNS-only/grey-cloud** records to start), and recreate
     every record identically.
  3. Change the nameservers at the registrar. Wait for propagation (up to
     48 h). Verify MX and Resend records resolve from the new nameservers
     **before** continuing:

     ```powershell
     nslookup -type=MX lilispics.com
     nslookup -type=TXT lilispics.com
     ```

  4. Send a test email to `hello@lilispics.com` and a test contact-form
     notification (Resend) to confirm mail still works.
- If DNS is hosted elsewhere (registrar, Cloudflare…), only A/AAAA/CNAME
  records change later. Note the provider in the report.

### A2. 🧑 Lower TTLs

At least 24 h before the cutover, set the TTL of the apex (`@`) and `www`
records to 300 s, so the switch and any rollback propagate quickly.

### A3. 🧑 Inventory Vercel settings

From Vercel → Project → Settings, note (values in the password manager, not
in chat):

- every Production environment variable (README §4 lists the expected set)
- the domains attached: apex, `www`, and which one redirects to which
- anything custom: redirects, headers, cron jobs (none expected)

### A4. 🧑 Dokploy server capacity

`next build` for one app needs roughly 2–3 GB of RAM. If the server has less
than 4 GB, add swap before the first build, or plan to build images
elsewhere (see Troubleshooting at the end). Check free disk space too (≥ 10 GB
free recommended for images and build cache).

### A5. 🧑 Connect GitHub to Dokploy

Dokploy → Settings → Git → GitHub: install the Dokploy GitHub App with access
to `noah-blanchard/simple-lilis-pics`.

---

## Section B: Staging on Dokploy (production unaffected)

### B1. 🧑 Create the project and two applications

Dokploy → Projects → **Create Project** `lilis-pics`. Inside it, create two
**Applications**: `web` and `admin`.

For **each** application, General tab:

| Setting | web | admin |
| --- | --- | --- |
| Provider | GitHub | GitHub |
| Repository | `noah-blanchard/simple-lilis-pics` | same |
| Branch | `refactor/monorepo` | `refactor/monorepo` |
| Build Type | **Dockerfile** | **Dockerfile** |
| Docker File | `apps/web/Dockerfile` | `apps/admin/Dockerfile` |
| Docker Context Path | `.` (repo root) | `.` (repo root) |
| Docker Build Stage | (empty → final stage) | (empty) |
| Autodeploy | on | on |
| Watch Paths | `apps/web/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` | `apps/admin/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` |

Watch paths make a push that only touches `apps/admin/**` skip rebuilding
`web`, and vice versa.

### B2. 🧑 DNS for staging hostnames

At the DNS provider, add A (and AAAA if applicable) records pointing to the
Dokploy server:

- `staging.lilispics.com`
- `staging-admin.lilispics.com`

These don't affect production.

### B3. 🧑 Build arguments and environment (staging)

In each application → **Environment** tab. Dokploy has a runtime
"Environment" block and a separate **"Build-time Arguments"** block.
`NEXT_PUBLIC_*` and `ADMIN_URL` go in **both**. They are inlined at build;
providing them at runtime too is harmless and keeps server code consistent.
Server secrets go in **runtime Environment only**.

**web: Build-time Arguments**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<prod supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod anon key>
NEXT_PUBLIC_SUPABASE_BUCKET=photos
NEXT_PUBLIC_SITE_URL=https://staging.lilispics.com
ADMIN_URL=https://staging-admin.lilispics.com
```

**web: Environment (runtime)**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<prod supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod anon key>
NEXT_PUBLIC_SUPABASE_BUCKET=photos
NEXT_PUBLIC_SITE_URL=https://staging.lilispics.com
ADMIN_URL=https://staging-admin.lilispics.com
SUPABASE_SERVICE_ROLE_KEY=<from password manager>
RESEND_API_KEY=<from password manager>
CONTACT_TO_EMAIL=<same as Vercel>
CONTACT_FROM_EMAIL=<same as Vercel>
REVALIDATE_SECRET=<new random value, generate as in phase 05 C2>
```

**admin: Build-time Arguments**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<prod supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod anon key>
NEXT_PUBLIC_SUPABASE_BUCKET=photos
NEXT_PUBLIC_SITE_URL=https://staging-admin.lilispics.com
```

**admin: Environment (runtime)**

```dotenv
NEXT_PUBLIC_SUPABASE_URL=<prod supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod anon key>
NEXT_PUBLIC_SUPABASE_BUCKET=photos
NEXT_PUBLIC_SITE_URL=https://staging-admin.lilispics.com
SUPABASE_SERVICE_ROLE_KEY=<from password manager>
OPENROUTER_API_KEY=<from password manager>
OPENROUTER_MODEL=<same as Vercel>
PORTFOLIO_URL=https://staging.lilispics.com
REVALIDATE_SECRET=<same value as web>
```

⚠️ **Staging uses the production database.** Every write made on staging is a
real production write. Rules for staging tests:

- Prefer read-only checks.
- Any write test must be reversible, labeled `TEST — delete me`, and undone
  in the same session.
- Contact-form tests email Lili's real inbox. Warn her, or use the subject
  `TEST`.

### B4. 🧑 Domains (staging)

Each application → **Domains** → Add Domain:

| App | Host | Path | Container Port | HTTPS | Certificate |
| --- | --- | --- | --- | --- | --- |
| web | `staging.lilispics.com` | `/` | `3000` | on | Let's Encrypt |
| admin | `staging-admin.lilispics.com` | `/` | `3000` | on | Let's Encrypt |

### B5. 🧑 Deploy

Click **Deploy** on `web`, then `admin`. Watch the build logs:

- `bun install --frozen-lockfile` succeeds, with no lockfile mismatch.
- `next build` succeeds, and its route table matches phase 05 C4.
- The container starts and becomes healthy.

If the build is OOM-killed (`exit code 137`), see Troubleshooting.

### B6. Staging smoke tests

The agent can run the `curl` checks if authorized. Login checks are 🧑.

| # | Check | Expected |
| --- | --- | --- |
| 1 | `curl -I https://staging.lilispics.com/` | 200, valid TLS |
| 2 | `/fr`, `/portfolio`, a project page, `/links`, `/fr/links` | 200, images load |
| 3 | `curl -s https://staging.lilispics.com/sitemap.xml` | URLs use `https://staging.lilispics.com` |
| 4 | `curl -I https://staging.lilispics.com/admin` | 307 → `https://staging-admin.lilispics.com/admin` |
| 5 | `curl -I https://staging-admin.lilispics.com/` | 307 → `/admin` → 307 → `/login` |
| 6 | 🧑 Log in at `https://staging-admin.lilispics.com/login` | hub loads, and all sections load |
| 7 | 🧑 Links editor: reversible edit → reload `https://staging.lilispics.com/links` | change visible **immediately**, then revert |
| 8 | 🧑 Generate a rating QR | URL starts with `https://staging.lilispics.com/rate/` and opens. Don't submit, or submit and delete. |
| 9 | 🧑 Click a link card on `https://staging.lilispics.com/links`, then check its click count in the admin links stats | count increments. This proves the proxy-safe same-origin check. |
| 10 | 🧑 Translate button on a project field | returns a translation |
| 11 | 🧑 Upload one small `TEST — delete me` photo to a test project, then delete it | upload works, and the object is removed |
| 12 | Next/Image: open a project page and check that an image request to `/_next/image?...` returns 200 | sharp OK |
| 13 | Dokploy logs for both apps | no `[revalidate]` errors, no unhandled errors |

All 13 must pass before Section C. Record results in the report.

---

## Section C: Production cutover

Plan a quiet time slot. Total hands-on time is about 30–60 min, plus DNS
propagation.

### C1. 🧑 Stop Vercel from building `master`

Vercel → Project → Settings → **Git** → **Disconnect** the repository (or
turn off production auto-deploys). The current production deployment keeps
serving. This prevents a failing Vercel build when the monorepo lands on
`master`. **Don't delete the Vercel project or its domains yet.** They are the
rollback path.

### C2. Merge the branch

🧑 (or the agent, if explicitly authorized to merge and push):

```powershell
git switch master
git pull
git merge --no-ff refactor/monorepo -m "Merge the monorepo migration"
git push origin master
```

### C3. 🧑 Repoint Dokploy to production values

For **both** applications:

1. General → Branch: `master`.
2. Environment and Build-time Arguments: change the URLs:

   | Variable | web | admin |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SITE_URL` (build + runtime) | `https://lilispics.com` | `https://admin.lilispics.com` |
   | `ADMIN_URL` (web build + runtime) | `https://admin.lilispics.com` | — |
   | `PORTFOLIO_URL` (admin runtime) | — | `https://lilispics.com` |

   Use the same apex-vs-`www` canonical choice as on Vercel (A3). The examples
   assume apex is canonical.
3. Domains: **add** `lilispics.com` (and `www.lilispics.com` if it was
   served) to `web`, and `admin.lilispics.com` to `admin`, all on port 3000
   with Let's Encrypt. Keep the staging domains for now.
4. **Deploy** both. The NEXT_PUBLIC values changed, so this rebuilds.

Let's Encrypt can't issue certificates for the production hostnames until
DNS points at Dokploy (C4). Traefik retries automatically. Expect a few
minutes of certificate warnings right after the DNS switch, at most. To
shrink that window, do C3 and C4 back to back.

### C4. 🧑 Switch DNS

At the DNS provider:

| Record | Value |
| --- | --- |
| `@` A | Dokploy server IPv4 (replace the Vercel IP `76.76.21.21` or similar) |
| `@` AAAA | Dokploy IPv6 if any. **Remove** Vercel AAAA records if present. |
| `www` | CNAME → `lilispics.com` (or A → server IP), matching the old setup |
| `admin` A | Dokploy server IPv4 (new) |

**Don't touch** MX, TXT, DKIM/Resend or any other records.

If `www` should redirect to the apex (or the reverse), configure that on the
`web` application in Dokploy: add the second domain and enable its redirect
option, or use the Traefik redirect middleware. Verify with
`curl -I https://www.lilispics.com`.

### C5. Production smoke tests

Repeat the B6 table against `https://lilispics.com` and
`https://admin.lilispics.com`, including the login checks (🧑). Also check:

- `nslookup lilispics.com` returns the Dokploy IP (from a network that
  doesn't cache the old value).
- `https://lilispics.com/sitemap.xml` uses `https://lilispics.com`.
- A rating QR now points at `https://lilispics.com/rate/...`.
- 🧑 Lili's bookmark `https://lilispics.com/admin` lands on
  `https://admin.lilispics.com/login` (or straight into the admin if she's
  logged in there).
- Contact form: one real test submission → email arrives → delete the
  message in admin.

### C6. 🧑 Supabase Auth URL configuration

Supabase → Authentication → URL Configuration:

- **Site URL:** `https://admin.lilispics.com` (only auth emails use it, e.g.
  invites and password resets).
- **Redirect URLs:** add `https://admin.lilispics.com/**`. Keep the old entries
  until Vercel is retired.

Email/password sign-in (what the admin uses) doesn't depend on these, but
auth emails would otherwise point at the old origin.

### C7. Rollback plan (keep ready for 7 days)

If production is broken and can't be fixed quickly:

1. 🧑 DNS: point `@` (and `www`) back to Vercel's values from A3. TTL is
   300 s.
2. The old Vercel production deployment still serves the pre-monorepo app.
   That includes its own `/admin`, against the same database, so nothing is
   lost.
3. Fix on a branch. Retry C3–C5 later.

Don't reconnect Vercel's Git integration for the rollback. The old
deployment serves as-is.

### C8. 🧑 Retire Vercel (after 7 stable days)

1. Vercel → Project → Domains: remove `lilispics.com` and `www`.
2. Delete (or archive) the Vercel project.
3. Supabase → Auth → Redirect URLs: remove the old Vercel or apex `/admin`
   entries.
4. Dokploy: remove the staging domains, or keep them on a separate staging
   branch. If kept, remember they write to production data.
5. DNS: delete the `staging*` records if staging is removed. Raise the TTLs
   back (e.g. 3600 s).

---

## Section D: Operational follow-ups (optional, record decisions)

- **Image cache persistence:** `next/image` caches optimized images in
  `apps/web/.next/cache/images` inside the container, which is lost on every
  redeploy. If that matters, add a Dokploy **volume mount** at
  `/app/apps/web/.next/cache` for `web`. The `nextjs` user (uid 1001) must be
  able to write to it.
- **Zero-downtime deploys:** Dokploy runs apps as Docker Swarm services. With
  the image `HEALTHCHECK` from phase 06, configure the service update order
  as start-first in the application's Advanced/Swarm settings, so the old
  container serves until the new one is healthy.
- **Monitoring:** add an uptime check (Dokploy monitoring, or an external
  service) for `https://lilispics.com/favicon.ico` and
  `https://admin.lilispics.com/favicon.ico`.
- **Dokploy backups:** the apps are stateless (all data is in Supabase), so
  back up the Dokploy configuration itself.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Build killed, `exit code 137` | Out of memory during `next build` | Add swap on the server, or build images elsewhere: a GitHub Actions workflow builds `apps/<app>/Dockerfile` and pushes to GHCR, and the Dokploy app uses the "Docker" provider (image pull). That would be a follow-up plan. Report it. |
| `lockfile had changes, but lockfile is frozen` | `bun.lock` not committed after a dependency change | Run `bun install` locally, commit `bun.lock`, push |
| Pages fine, images broken | `NEXT_PUBLIC_SUPABASE_URL` missing at **build** → no `remotePatterns` host | Put it in Build-time Arguments and redeploy |
| Admin shows `Missing env var: SUPABASE_SERVICE_ROLE_KEY` | Runtime env missing | Add it to the admin runtime Environment and restart |
| Link edits take ~5 min to appear | Webhook failing | Check the admin logs for `[revalidate]`. Check that `PORTFOLIO_URL` is the public web origin and that `REVALIDATE_SECRET` is identical in both apps. |
| Click counts stop | Same-origin check rejecting | Check the web logs for 403 on `/api/links/*/click`. Traefik must forward the `X-Forwarded-Proto`/`Host` headers (default). |
| `/admin` on web redirects to localhost | `ADMIN_URL` was missing at web **build** | Add it to web Build-time Arguments and redeploy |
| Certificate error after DNS switch | Let's Encrypt still issuing | Wait 1–5 min. Check the Traefik logs in Dokploy. Make sure ports 80/443 are open on the server firewall. |

---

## Definition of done

- [ ] DNS inventory done, and mail/Resend records verified intact.
- [ ] Staging: 13/13 checks passed.
- [ ] Production: `lilispics.com` and `admin.lilispics.com` served by Dokploy
      with valid TLS. Smoke tests passed.
- [ ] Supabase Auth URLs updated.
- [ ] Rollback path documented with the old Vercel values (kept 7 days).
- [ ] Report delivered with each check's result. STOP.
