# Phase 05: `apps/admin` (admin.lilispics.com)

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Create the admin app and move the whole CMS into it:

- The UI (`/login`, `/admin/*`), unchanged paths (decision D10).
- **All authenticated API routes**, plus the unauthenticated `GET /api/projects`
  and `GET /api/tags` that only the admin uses.
- Only public routes stay in `apps/web`: `POST /api/contact`,
  `POST /api/ratings`, the two click beacons, and a **new**
  `POST /api/revalidate` webhook.

Then fix the three cross-origin consequences:

1. **Cache busting.** The admin's links save can no longer call
   `revalidateTag` on the web app's cache. It calls web's `/api/revalidate`
   instead.
2. **QR URLs.** `buildRateUrl()` must point at the portfolio origin, so admin
   gets `PORTFOLIO_URL`.
3. **Old bookmarks.** `lilispics.com/admin*` and `/login` redirect to the
   admin origin (`ADMIN_URL`).

## Preconditions

- [ ] Phase 04 is committed, and build passes from the root.
- [ ] Branch `refactor/monorepo`, clean tree, `master` not ahead (README §8).
- [ ] Lockfile snapshot taken (README §7.3).

## Out of scope

- Flattening admin URLs (e.g. `/admin/projects` → `/projects`). Not now.
- Any visual or behavioral change in the CMS.
- Docker or deployment (phase 06+).
- Full docs rewrite (phase 09). This phase only updates `.env.example` files
  and the local-development env table.

---

## Step 1: Read the docs (AGENTS.md requirement)

Under `node_modules/next/dist/docs/01-app/`:

- `03-api-reference/03-file-conventions/proxy.md` (Proxy, matcher).
- `03-api-reference/05-config/01-next-config-js/redirects.md` (external
  destinations, and redirects run before Proxy).
- `03-api-reference/03-file-conventions/layout.md` (root layout requirements).
- `03-api-reference/04-functions/revalidateTag.md` (second argument in v16).

If a filename differs slightly, use `ls` in that folder to find it.

---

## Part A: Scaffold `apps/admin` and move the CMS UI

### A1. Create the app shell files

`apps/admin/package.json`. Start with this, then finalize `dependencies` in
step A6:

```json
{
  "name": "@lili/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3051",
    "build": "next build",
    "start": "next start --port 3051",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lili/core": "workspace:*",
    "@lili/ui": "workspace:*",
    "next": "16.2.7",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@lili/config": "workspace:*",
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

`apps/admin/tsconfig.json`: identical to `apps/web/tsconfig.json`.

`apps/admin/postcss.config.mjs`: identical to `apps/web/postcss.config.mjs`.

`apps/admin/next.config.ts`:

```ts
import type { NextConfig } from "next";

// Derive the Supabase Storage host from the env var so uploaded images work
// against any project — never hardcode a specific project ref.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  transpilePackages: ["@lili/core", "@lili/ui"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  // The CMS keeps its historical /admin/* paths; the bare origin opens it.
  async redirects() {
    return [{ source: "/", destination: "/admin", permanent: false }];
  },
};

export default nextConfig;
```

(No next-intl plugin: the admin is not localized. It only imports the `Locale`
**type** from `@lili/core/i18n/routing`.)

`apps/admin/src/app/globals.css`:

```css
@import "tailwindcss";
@import "@lili/ui/styles/theme.css";
@import "@lili/ui/styles/base.css";

/* Shared components live in packages/ui, outside this app's folder.
   Path is relative to this file. */
@source "../../../../packages/ui/src";
```

(If phase 04 had to use the relative-import fallback for the CSS imports, use
the same fallback here.)

`apps/admin/src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

/** The CMS is private: keep every crawler out. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
```

### A2. Move the CMS UI with `git mv`

From the repo root:

```bash
mkdir -p apps/admin/src/app apps/admin/src/components apps/admin/src/lib/translate apps/admin/public

git mv "apps/web/src/app/(admin)/layout.tsx"  apps/admin/src/app/layout.tsx
git mv "apps/web/src/app/(admin)/admin"       apps/admin/src/app/admin
git mv "apps/web/src/app/(admin)/login"       apps/admin/src/app/login
git mv apps/web/src/components/admin          apps/admin/src/components/admin
git mv apps/web/src/lib/admin                 apps/admin/src/lib/admin
git mv apps/web/src/lib/translate/use-translate.ts apps/admin/src/lib/translate/use-translate.ts
```

Copies (the web app keeps its own):

```bash
cp apps/web/src/lib/fonts.ts      apps/admin/src/lib/fonts.ts
cp apps/web/src/app/favicon.ico   apps/admin/src/app/favicon.ico
cp apps/web/public/logo.webp      apps/admin/public/logo.webp      # used by the Links editor preview
git add apps/admin/src/lib/fonts.ts apps/admin/src/app/favicon.ico apps/admin/public/logo.webp
```

`apps/web/src/app/(admin)/` should now be empty, and so should
`apps/web/src/lib/translate/`.

### A3. Fix the moved root layout

In `apps/admin/src/app/layout.tsx`, change `import "../globals.css";` to
`import "./globals.css";`. Update its doc comment: it is now the app's root
layout, not a route-group layout. Nothing else changes, including metadata,
viewport and fonts.

### A4. Check that every `@/` import in admin resolves inside admin

The admin files keep their `@/components/admin/...`, `@/lib/admin/...`,
`@/lib/translate/use-translate` and `@/lib/fonts` imports. Those paths exist
under `apps/admin/src`. Everything shared already points at `@lili/core` or
`@lili/ui` (phases 02–04). Verify:

```bash
git grep -ohE '"@/[^"]+"' -- apps/admin | sort -u
```

Every printed specifier must map to an existing file under `apps/admin/src/`
(`.ts` or `.tsx`). Expected set: `@/components/admin/...` (many),
`@/lib/admin/sections`, `@/lib/translate/use-translate`, `@/lib/fonts`. If
anything else appears (e.g. a web-only component), STOP and report. That would
mean a hidden coupling this plan didn't anticipate.

Also verify nothing in web still references admin code:

```bash
git grep -nE '"@/(components/admin|lib/admin|lib/translate/use-translate)' -- apps/web   # empty
```

### A5. Trim the web app's fonts

In `apps/web/src/lib/fonts.ts`, delete the admin font set: the
`adminDisplay` and `adminSans` declarations, the `adminFontVariables` export,
and the now-unused `Cormorant_Garamond` and `Lexend_Deca` names from the
import. Keep `publicDisplay`, `publicSans`, `mono` and `publicFontVariables`
exactly as they are. `apps/admin/src/lib/fonts.ts` keeps **both** sets, because
the Links editor preview uses `publicFontVariables`.

### A6. Finalize dependencies for both apps

Derive each app's direct imports (bare specifiers only):

```bash
for app in web admin; do
  echo "== $app"
  git grep -hoE "from \"[^\".][^\"]*\"|import \"[^\".][^\"]*\"" -- "apps/$app/src" "apps/$app/scripts" 2>/dev/null \
    | sed -E 's/^(from|import) "//; s/"$//' \
    | sed -E 's#^(@[^/]+/[^/]+|[^@/][^/]*).*#\1#' \
    | sort -u
done
```

Then:

- **admin** `dependencies`: add every printed third-party package, using the
  exact version range from `apps/web/package.json` (or `@lili/core`'s for
  `@supabase/ssr`). Ignore `server-only`, `next/*` (covered by `next`), and
  the `@lili/*` workspaces, which are already listed. Expected roughly:
  `@hookform/resolvers`, `@supabase/ssr`, `@tanstack/react-query`,
  `browser-image-compression`, `motion`, `qrcode`, `react-hook-form`, `zod`,
  plus `react-icons` if printed. Add `"@types/qrcode"` to devDependencies if
  `qrcode` is used.
- **web** `dependencies`: remove a package only if it is **not** printed for
  web, is not `next`/`react`/`react-dom`, and is not needed by a config file
  (`next.config.ts` uses `next-intl/plugin`, so keep `next-intl`). Expected
  removals: `@openrouter/sdk`, `resend`, `qrcode`, `browser-image-compression`,
  and likely `@tanstack/react-query`. Keep `@supabase/supabase-js` (seed
  script) and anything else printed. Remove `@types/qrcode` if `qrcode` is
  removed.
- Note: `@lili/core` declares its own runtime dependencies, so removing
  `resend`/`@openrouter/sdk` from web does not remove them from the install.

Run `bun install` and the lockfile guard. **No third-party package may change
version.** Only declarations move.

### A7. Commit Part A

Don't run the full verification here. The admin has no API routes yet (they
are still served by web), so the state is intentionally incomplete even if it
happens to compile. Commit and continue to Part B. Verification happens in
Part C.

```text
Move the CMS UI into apps/admin

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Part B: Split the API between the apps

### B1. Move whole admin route shims (`git mv`)

These route files are entirely admin-owned. Move them with their folders,
from the repo root:

```bash
W=apps/web/src/app/api
A=apps/admin/src/app/api
mkdir -p "$A/contact/[id]" "$A/links" "$A/projects/reorder" "$A/projects/[id]/photos" \
         "$A/rating-tokens" "$A/ratings/[id]" "$A/tags/[id]" "$A/translate"

git mv "$W/contact/[id]/route.ts"         "$A/contact/[id]/route.ts"
git mv "$W/links/route.ts"                "$A/links/route.ts"
git mv "$W/projects/route.ts"             "$A/projects/route.ts"
git mv "$W/projects/reorder/route.ts"     "$A/projects/reorder/route.ts"
git mv "$W/projects/[id]/route.ts"        "$A/projects/[id]/route.ts"
git mv "$W/projects/[id]/photos/route.ts" "$A/projects/[id]/photos/route.ts"
git mv "$W/rating-tokens/route.ts"        "$A/rating-tokens/route.ts"
git mv "$W/ratings/[id]/route.ts"         "$A/ratings/[id]/route.ts"
git mv "$W/tags/route.ts"                 "$A/tags/route.ts"
git mv "$W/tags/[id]/route.ts"            "$A/tags/[id]/route.ts"
git mv "$W/translate/route.ts"            "$A/translate/route.ts"
```

### B2. Split the two mixed route files

`apps/web/src/app/api/contact/route.ts` becomes (public POST only):

```ts
import { submitContactMessage } from "@lili/core/handlers/contact";

export const POST = submitContactMessage;
```

New `apps/admin/src/app/api/contact/route.ts` (admin GET only):

```ts
import { listContactMessages } from "@lili/core/handlers/contact";

export const GET = listContactMessages;
```

`apps/web/src/app/api/ratings/route.ts` becomes (public POST only):

```ts
import { submitRating } from "@lili/core/handlers/ratings";

export const POST = submitRating;
```

New `apps/admin/src/app/api/ratings/route.ts` (admin GET only):

```ts
import { listRatings } from "@lili/core/handlers/ratings";

export const GET = listRatings;
```

### B3. Expected final route inventory

`apps/web/src/app/api/` (public only):

| Route | Methods |
| --- | --- |
| `contact/route.ts` | POST |
| `ratings/route.ts` | POST |
| `links/[id]/click/route.ts` | POST |
| `links/socials/[id]/click/route.ts` | POST |
| `revalidate/route.ts` (new, B5) | POST |

`apps/admin/src/app/api/`:

| Route | Methods |
| --- | --- |
| `contact/route.ts` | GET |
| `contact/[id]/route.ts` | PATCH, DELETE |
| `links/route.ts` | GET, PUT |
| `projects/route.ts` | GET, POST |
| `projects/reorder/route.ts` | PATCH |
| `projects/[id]/route.ts` | PATCH, DELETE |
| `projects/[id]/photos/route.ts` | POST |
| `rating-tokens/route.ts` | POST |
| `ratings/route.ts` | GET |
| `ratings/[id]/route.ts` | PATCH, DELETE |
| `tags/route.ts` | GET, POST |
| `tags/[id]/route.ts` | PATCH, DELETE |
| `translate/route.ts` | POST |

Every admin client call (`apiFetch("/api/...")` in `apps/admin/src/**`) is
same-origin and keeps working. Every public client call (contact form, rating
submission, link beacons) is same-origin on web and keeps working. Check:

```bash
git grep -nE '"/api/|`/api/' -- apps/web/src apps/admin/src packages/ui/src
```

Each path printed under `apps/web` or `packages/ui/src/components/links`
must be in the web inventory. Each under `apps/admin` must be in the admin
inventory.

### B4. Shared cache-tag constants and the revalidation client (core)

New `packages/core/src/cache-tags.ts`:

```ts
/** Cache tags for public data cached with `unstable_cache`. The admin app
 *  cannot call `revalidateTag` on another app's cache, so after a CMS mutation
 *  it asks each public app to drop these tags via POST /api/revalidate. */
export const PUBLIC_CACHE_TAGS = ["public-links"] as const;

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[number];

export const PUBLIC_LINKS_TAG: PublicCacheTag = "public-links";
```

In `packages/core/src/data/links.ts`, use the constant instead of the string
literal (behavior unchanged):

- add `import { PUBLIC_LINKS_TAG } from "../cache-tags";`
- `["public-links"],` → `[PUBLIC_LINKS_TAG],`
- `{ tags: ["public-links"], revalidate: 300 }` →
  `{ tags: [PUBLIC_LINKS_TAG], revalidate: 300 }`

New `packages/core/src/revalidate.ts`:

```ts
import "server-only";
import type { PublicCacheTag } from "./cache-tags";

const REVALIDATE_TIMEOUT_MS = 5000;

/** Public app origins that cache CMS data. Today only the portfolio does. */
function revalidationTargets(): string[] {
  return [process.env.PORTFOLIO_URL].filter((url): url is string =>
    Boolean(url),
  );
}

/** Ask every public app to drop the given cache tags. Best effort: a failure is
 *  logged and never fails the admin mutation — the data is already saved, and
 *  the public cache still expires on its own `revalidate` window (300 s for
 *  links). Never logs the secret. */
export async function requestPublicRevalidation(
  tags: PublicCacheTag[],
): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  const targets = revalidationTargets();
  if (!secret || targets.length === 0) {
    console.warn(
      "[revalidate] REVALIDATE_SECRET or PORTFOLIO_URL is not set; public caches will refresh on their own schedule",
    );
    return;
  }

  await Promise.all(
    targets.map(async (base) => {
      const url = `${base.replace(/\/$/, "")}/api/revalidate`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({ tags }),
          cache: "no-store",
          signal: AbortSignal.timeout(REVALIDATE_TIMEOUT_MS),
        });
        if (!response.ok) {
          console.error(`[revalidate] ${url} responded ${response.status}`);
        }
      } catch (error) {
        console.error(
          `[revalidate] ${url} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }),
  );
}
```

### B5. The webhook handler (core) and its web route

New `packages/core/src/handlers/revalidate.ts`:

```ts
import "server-only";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { apiError, apiSuccess } from "../api/response";
import { validate } from "../api/validate";
import { PUBLIC_CACHE_TAGS } from "../cache-tags";

const revalidateBodySchema = z.object({
  tags: z.array(z.enum(PUBLIC_CACHE_TAGS)).min(1),
});

function bearerMatches(header: string | null, secret: string): boolean {
  const prefix = "Bearer ";
  if (!header?.startsWith(prefix)) return false;
  const given = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** POST /api/revalidate — server-to-server webhook called by the admin app
 *  after a CMS mutation. Authenticated with the shared REVALIDATE_SECRET;
 *  only whitelisted public cache tags can be revalidated. */
export async function handleRevalidateWebhook(
  request: Request,
): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return apiError(
      "REVALIDATE_DISABLED",
      "Revalidation is not configured",
      503,
    );
  }
  if (!bearerMatches(request.headers.get("authorization"), secret)) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(revalidateBodySchema, body);
  if (!parsed.ok) return parsed.response;

  for (const tag of parsed.data.tags) {
    revalidateTag(tag, { expire: 0 });
  }
  return apiSuccess({ revalidated: parsed.data.tags });
}
```

(`revalidateTag(tag, { expire: 0 })` is the exact call the links handler used
before. Confirm against `revalidateTag.md` from step 1.)

New `apps/web/src/app/api/revalidate/route.ts`:

```ts
import { handleRevalidateWebhook } from "@lili/core/handlers/revalidate";

export const POST = handleRevalidateWebhook;
```

### B6. Switch the links handler to the webhook

In `packages/core/src/handlers/links.ts`:

1. Remove `import { revalidateTag } from "next/cache";`.
2. Add `import { PUBLIC_LINKS_TAG } from "../cache-tags";` and
   `import { requestPublicRevalidation } from "../revalidate";`.
3. Replace `revalidateTag("public-links", { expire: 0 });` with
   `await requestPublicRevalidation([PUBLIC_LINKS_TAG]);`.

Then confirm no other handler revalidates anything:

```bash
git grep -n "revalidateTag\|revalidatePath" -- packages apps   # only handlers/revalidate.ts
```

### B7. QR URLs point at the portfolio

In `packages/core/src/rating.ts`, replace:

```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3050";
```

with:

```ts
/** Origin of the public portfolio, where `/rate/...` lives. `buildRateUrl` runs
 *  only in the admin app (rating-tokens handler), whose own NEXT_PUBLIC_SITE_URL
 *  is the admin origin, so the portfolio origin comes from PORTFOLIO_URL. */
const PORTFOLIO_URL = process.env.PORTFOLIO_URL ?? "http://localhost:3050";
```

and in `buildRateUrl`, `SITE_URL` → `PORTFOLIO_URL`. Update the function's
doc comment if it mentions the site URL.

### B8. Proxies

Replace `apps/web/src/proxy.ts` entirely with:

```ts
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@lili/core/i18n/routing";

// Next.js 16 renamed `middleware` to `proxy`. The admin CMS lives in its own
// app (admin.lilispics.com); old /admin and /login URLs are redirected by
// next.config.ts before this runs. This proxy only localizes the public site.
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The hidden rating flow carries its locale as a path segment (/rate/fr/…)
  // rather than a next-intl prefix, so a scanned QR always opens in the
  // language Lili picked. Let it through untouched — next-intl would otherwise
  // read "rate" as an unknown locale and redirect to /en/rate/….
  if (pathname.startsWith("/rate")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals (_next, _vercel)
  // - files with an extension (e.g. /favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

Create `apps/admin/src/proxy.ts`. It is the admin half of the old proxy,
verbatim, with the intl and rate branches removed:

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@lili/core/env";

// Next.js 16 renamed `middleware` to `proxy`. The admin app is gated by
// Supabase Auth: refresh the session cookie on every page request and redirect
// between /login and /admin. DB-level RLS and `withAuth` remain the real
// security boundary; this only handles redirects + cookie refresh.
async function handleAdminAuth(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export default function proxy(request: NextRequest) {
  return handleAdminAuth(request);
}

export const config = {
  // Match all pathnames except API routes, Next.js internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### B9. Redirect old admin URLs on the web app

In `apps/web/next.config.ts`, add above `nextConfig`:

```ts
// The CMS moved to its own origin. ADMIN_URL is read at build time (redirects
// are compiled into the routes manifest), so it must be a build argument in
// Docker. Local default = the admin dev server.
const adminUrl = (process.env.ADMIN_URL ?? "http://localhost:3051").replace(
  /\/$/,
  "",
);
```

and inside `nextConfig`:

```ts
  async redirects() {
    return [
      {
        source: "/admin/:path*",
        destination: `${adminUrl}/admin/:path*`,
        permanent: false,
      },
      { source: "/login", destination: `${adminUrl}/login`, permanent: false },
    ];
  },
```

Keep `permanent: false` until the production cutover has been stable for a
while. Changing it is a later, separate decision.

### B10. Root scripts

Root `package.json` → `scripts`, add next to `dev:web`:

```json
"dev:admin": "turbo run dev --filter=@lili/admin",
```

### B11. Commit Part B

```text
Split the API between web and admin with a revalidation webhook

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Part C: Environment and verification

### C1. `.env.example` files

`apps/web/.env.example`: keep the Supabase, site and Resend sections. Remove
the OpenRouter section (translation is admin-only now). Append:

```dotenv
# ─────────────────────────────────────────────────────────────
# Cross-app wiring
# ─────────────────────────────────────────────────────────────

# Shared secret for POST /api/revalidate (server-to-server, from the admin app).
# SECRET — must equal REVALIDATE_SECRET in apps/admin. Generate with:
#   bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
REVALIDATE_SECRET=

# Admin origin. Old /admin and /login URLs redirect here. Read at BUILD time.
ADMIN_URL=http://localhost:3051
```

Set the `NEXT_PUBLIC_SITE_URL` comment example to `http://localhost:3050`
locally / `https://lilispics.com` in production.

`apps/admin/.env.example` (new):

```dotenv
# ─────────────────────────────────────────────────────────────
# Supabase — same project as the web app
# ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SECRET, server only. Used by the CMS route handlers (bypasses RLS).
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=photos

# ─────────────────────────────────────────────────────────────
# Site
# ─────────────────────────────────────────────────────────────
# This app's own origin (local: http://localhost:3051, prod: https://admin.lilispics.com)
NEXT_PUBLIC_SITE_URL=http://localhost:3051

# Public portfolio origin: QR rating links point here, and the admin calls its
# /api/revalidate after CMS edits. (local: http://localhost:3050, prod: https://lilispics.com)
PORTFOLIO_URL=http://localhost:3050

# SECRET — must equal REVALIDATE_SECRET in apps/web.
REVALIDATE_SECRET=

# ─────────────────────────────────────────────────────────────
# OpenRouter — AI translation of admin form fields
# ─────────────────────────────────────────────────────────────
# SECRET, server only.
OPENROUTER_API_KEY=
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

(Keep `OPENROUTER_MODEL` equal to whatever `apps/web/.env.example` had.)

### C2. 🧑 Operator updates local env files

Ask the operator to:

1. Generate a secret:
   `bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
2. In `apps/web/.env.local`: add `REVALIDATE_SECRET=<secret>` and
   `ADMIN_URL=http://localhost:3051`. The OpenRouter lines can be removed.
3. Create `apps/admin/.env.local` from `apps/admin/.env.example`, copying the
   Supabase values and the OpenRouter key from the web file, with
   `REVALIDATE_SECRET=<same secret>` and `PORTFOLIO_URL=http://localhost:3050`.

Wait for confirmation.

### C3. Update the local-development env table

In `docs/local-development.md`, update the environment-variable table so it
states which app needs each variable (use README §4 of this plan as the
source), and that each app has its own `.env.local`. Mention
`bun run dev:admin` and the admin URL `http://localhost:3051/login`.

### C4. Verify

```bash
bun run lint
bun run typecheck      # core, ui, web, admin
bun run build          # web and admin
git grep -n '"@/' -- packages/   # empty
```

Build output checks:

- web route table shows exactly 5 `/api/*` routes (B3), and no `/admin` or
  `/login` pages.
- admin route table shows `/admin`, `/admin/featured`, `/admin/links`,
  `/admin/messages`, `/admin/projects`, `/admin/ratings`, `/login`,
  `/robots.txt`, and the 13 API routes.

Dev smoke test, `bun run dev` (both apps):

| Check | Expected |
| --- | --- |
| `curl -I http://localhost:3050/admin` | 307 → `http://localhost:3051/admin` |
| `curl -I http://localhost:3050/admin/projects` | 307 → `http://localhost:3051/admin/projects` |
| `curl -I http://localhost:3050/login` | 307 → `http://localhost:3051/login` |
| `curl -I http://localhost:3051/` | 307 → `/admin` |
| `curl -I http://localhost:3051/admin` (no cookie) | 307 → `/login` |
| `curl -s http://localhost:3051/api/contact` | 401 UNAUTHORIZED envelope |
| `curl -s -X POST http://localhost:3050/api/revalidate` | 401 UNAUTHORIZED envelope |
| `curl -s -X POST http://localhost:3050/api/revalidate -H "authorization: Bearer wrong" -H "content-type: application/json" -d '{"tags":["public-links"]}'` | 401 |
| `curl -s http://localhost:3050/api/tags` | 404 (moved to admin) |
| `curl -s http://localhost:3051/api/tags` | 200 envelope with tags |
| `curl -s http://localhost:3051/robots.txt` | `Disallow: /` |
| web pages `/`, `/fr`, `/portfolio`, `/links`, `/rate/en/AAAAAAAAAA` | 200 |

🧑 Operator checks (logged in at `http://localhost:3051/login`):

1. Every admin section loads (projects, featured, ratings, messages, links).
2. **Revalidation:** open `http://localhost:3050/links` in another tab. In the
   admin Links editor, make a visible reversible change (e.g. edit a
   subtitle) and save. Reload the public page: the change shows
   **immediately**, not after 5 minutes. Revert the change and save again.
   The admin dev-server terminal must show no `[revalidate]` error.
3. **QR URL:** in Ratings, generate a QR (EN). The displayed URL starts with
   `http://localhost:3050/rate/en/`. Open it: the rating page renders. Don't
   submit. Let it expire, or submit a test rating and delete it in moderation.
4. Translation button works on a project form field (no save needed).
5. Optional write test: submit the web contact form → the message appears in
   admin Messages → delete it.

### C5. Commit Part C

```text
Document per-app environment and wire local admin/web development

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Definition of done

- [ ] `apps/admin` runs on 3051 with the CMS at its historical paths, and `/`
      redirects to `/admin`.
- [ ] Web keeps only the 5 public API routes. Admin owns the 13 CMS routes.
- [ ] The links save triggers web's `/api/revalidate` (operator-verified).
- [ ] QR URLs use `PORTFOLIO_URL`.
- [ ] `lilispics.com/admin*` and `/login` redirect to `ADMIN_URL`.
- [ ] Dependencies are declared where they are imported, and no version
      changed.
- [ ] Lint, typecheck and build pass. Smoke tests pass, with the operator
      part reported.
- [ ] Three commits (A, B, C). Phase report delivered. STOP.
