# Phase 08: `apps/wedding` scaffold (wedding.lilispics.com)

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Create the third app as a **bilingual (EN/FR) scaffold**, wired exactly like
the portfolio (next-intl, shared theme, shared packages, Dockerfile), with a
single placeholder home page. It stays **noindex** until the wedding product
is designed.

**Explicitly out of scope (user decision D11):** wedding features, content
model, database changes, admin sections for weddings, contact form, galleries,
pricing, and copywriting beyond the placeholder. Don't add any of them, even if
they seem obvious.

## Preconditions

- [ ] Phase 06 is committed (Dockerfile pattern exists). Phase 07 Section A/B
      is done if you want to deploy the wedding app in Part C.
- [ ] Branch: `refactor/monorepo` if phase 07 §C2 has not happened yet,
      otherwise a new branch `feat/wedding-scaffold` cut from `master`.
      Ask the operator which one applies.
- [ ] Clean tree. Lockfile snapshot taken (README §7.3).

---

## Part A: Create the app

### A1. Files to create

```text
apps/wedding/
├─ package.json
├─ tsconfig.json              (identical to apps/web/tsconfig.json)
├─ postcss.config.mjs         (identical to apps/web/postcss.config.mjs)
├─ next.config.ts
├─ Dockerfile
├─ .env.example
├─ messages/en.json
├─ messages/fr.json
└─ src/
   ├─ proxy.ts
   ├─ i18n/request.ts
   ├─ i18n/navigation.ts
   ├─ lib/fonts.ts
   └─ app/
      ├─ favicon.ico          (copy of apps/web/src/app/favicon.ico)
      ├─ globals.css
      ├─ layout.tsx
      ├─ robots.ts
      └─ [locale]/
         ├─ layout.tsx
         └─ page.tsx
```

### A2. `apps/wedding/package.json`

Use the exact version ranges from `apps/web/package.json` for `next-intl`.

```json
{
  "name": "@lili/wedding",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3052",
    "build": "next build",
    "start": "next start --port 3052",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lili/core": "workspace:*",
    "@lili/ui": "workspace:*",
    "next": "16.2.7",
    "next-intl": "^4.13.0",
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

### A3. `apps/wedding/next.config.ts`

Same as web, minus the admin redirects. Use `output` exactly as phase 06
ended up using it (unconditional or env-gated):

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Derive the Supabase Storage host from the env var so uploaded images work
// against any project — never hardcode a specific project ref.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@lili/core", "@lili/ui"],
  images: {
    remotePatterns: [
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
};

export default withNextIntl(nextConfig);
```

### A4. i18n wiring (same routing as the portfolio)

`apps/wedding/src/i18n/request.ts`: copy `apps/web/src/i18n/request.ts`
verbatim. It already imports `routing` from `@lili/core/i18n/routing` and
loads `../../messages/${locale}.json`.

`apps/wedding/src/i18n/navigation.ts`: copy `apps/web/src/i18n/navigation.ts`
verbatim.

`apps/wedding/src/proxy.ts`:

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "@lili/core/i18n/routing";

// Next.js 16 calls this file `proxy`. The wedding site is public and
// localized: English unprefixed, French under /fr (localePrefix "as-needed").
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next.js internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### A5. Messages (key parity required)

`apps/wedding/messages/en.json`:

```json
{
  "meta": {
    "title": "Lilis Pics — Weddings",
    "description": "Wedding photography by Lili. Coming soon."
  },
  "home": {
    "eyebrow": "Lilis Pics · Weddings",
    "title": "Wedding stories, coming soon.",
    "body": "This space is being prepared. In the meantime, discover Lili's work on the main portfolio.",
    "portfolioLink": "Visit the portfolio"
  }
}
```

`apps/wedding/messages/fr.json`:

```json
{
  "meta": {
    "title": "Lilis Pics — Mariages",
    "description": "Photographie de mariage par Lili. Bientôt disponible."
  },
  "home": {
    "eyebrow": "Lilis Pics · Mariages",
    "title": "Des histoires de mariage, bientôt.",
    "body": "Cet espace est en préparation. En attendant, découvrez le travail de Lili sur le portfolio principal.",
    "portfolioLink": "Voir le portfolio"
  }
}
```

### A6. Fonts, CSS, layouts, page

`apps/wedding/src/lib/fonts.ts`: copy `apps/web/src/lib/fonts.ts` as it is
after phase 05 (public set only: `publicFontVariables`). Wedding typography is
a future design decision. Reusing the portfolio's is the neutral default.

`apps/wedding/src/app/globals.css`: identical to
`apps/admin/src/app/globals.css` (3 imports + `@source`, or the relative
fallback if phases 04/05 used it).

`apps/wedding/src/app/layout.tsx`:

```tsx
import type { ReactNode } from "react";

// The `<html>` and `<body>` tags live in `app/[locale]/layout.tsx` so they can
// receive the active locale. This root layout only forwards children.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
```

`apps/wedding/src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";

/** Scaffold only: keep the wedding site out of search engines until launch.
 *  Replace with real rules (and add a sitemap) when the site goes live. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
```

`apps/wedding/src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@lili/core/i18n/routing";
import { publicFontVariables } from "@/lib/fonts";
import "../globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3052";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    // Scaffold: not indexed until the wedding site launches.
    robots: { index: false, follow: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className={publicFontVariables}>
      <body className="bg-ink font-sans text-fg antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
```

`apps/wedding/src/app/[locale]/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from "next-intl/server";

// Placeholder until the wedding experience is designed. The portfolio origin
// is fixed on purpose: this page only exists to point visitors there.
const PORTFOLIO_ORIGIN = "https://lilispics.com";

export default async function WeddingHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const portfolioHref =
    locale === "fr" ? `${PORTFOLIO_ORIGIN}/fr` : PORTFOLIO_ORIGIN;

  return (
    <main className="container-site section-y flex min-h-dvh flex-col justify-center gap-6">
      <p className="tag-mono uppercase">{t("eyebrow")}</p>
      <h1 className="display-xl max-w-4xl text-[clamp(40px,6vw,88px)] text-fg">
        {t("title")}
      </h1>
      <p className="max-w-xl text-body-fluid text-fg/70">{t("body")}</p>
      <a
        href={portfolioHref}
        className="tag-mono w-fit text-accent-strong underline underline-offset-4"
      >
        {t("portfolioLink")}
      </a>
    </main>
  );
}
```

No animation, so the motion rule isn't involved. If Biome's
`useSortedClasses` (warn) suggests a different class order, apply
`bun run fix`.

### A7. `.env.example`

```dotenv
# Public origin of this app (local: http://localhost:3052, prod: https://wedding.lilispics.com)
NEXT_PUBLIC_SITE_URL=http://localhost:3052

# Supabase — same project as the other apps. Not used by the scaffold yet, but
# required as soon as a page imports @lili/core data or env modules.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_BUCKET=photos
```

🧑 Operator: create `apps/wedding/.env.local` from it (only
`NEXT_PUBLIC_SITE_URL` is needed for the scaffold).

### A8. Dockerfile

`apps/wedding/Dockerfile`: copy `apps/admin/Dockerfile` and replace every
`admin` path and name with `wedding`. Build args: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_BUCKET`,
`NEXT_PUBLIC_SITE_URL`. Header secrets list: "none yet".

### A9. Root scripts and favicon

- Root `package.json` → `"dev:wedding": "turbo run dev --filter=@lili/wedding"`.
- `cp apps/web/src/app/favicon.ico apps/wedding/src/app/favicon.ico`.

### A10. Install and verify

```bash
bun install          # then lockfile guard: only @lili/wedding added
bun run lint
bun run typecheck
bun run build        # web, admin, wedding
```

Key-parity check for wedding messages (the agent can run this):

```bash
bun -e "const a=require('./apps/wedding/messages/en.json'),b=require('./apps/wedding/messages/fr.json');const k=(o,p='')=>Object.entries(o).flatMap(([x,v])=>typeof v==='object'?k(v,p+x+'.'):[p+x]);const A=k(a).sort().join(),B=k(b).sort().join();console.log(A===B?'parity ok':'MISMATCH');"
```

Dev smoke test, `bun run dev:wedding`:

| URL | Expected |
| --- | --- |
| `http://localhost:3052/` | 200, English placeholder, shared fonts and colors |
| `http://localhost:3052/fr` | 200, French placeholder |
| `http://localhost:3052/en` | redirect to `/` (as-needed prefix, same as the portfolio) |
| `http://localhost:3052/robots.txt` | `Disallow: /` |
| page `<head>` | `<meta name="robots" content="noindex, nofollow">` |

### A11. Commit

```text
Scaffold the bilingual wedding app

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Part B: Documentation touch

- `docs/local-development.md`: add the wedding app (port 3052,
  `bun run dev:wedding`, its `.env.local`).
- Phase 09 covers the rest.

Commit together with Part A, or as `Document the wedding app scaffold`.

---

## Part C: 🧑 Deploy on Dokploy (optional now, needs phase 07 §A done)

1. DNS: A record `wedding` → Dokploy server IP.
2. Dokploy project `lilis-pics` → new Application `wedding`:

   | Setting | Value |
   | --- | --- |
   | Provider / repo | GitHub, `noah-blanchard/simple-lilis-pics` |
   | Branch | `master` if phase 07 §C is done, else `refactor/monorepo` |
   | Build Type | Dockerfile |
   | Docker File | `apps/wedding/Dockerfile` |
   | Docker Context Path | `.` |
   | Watch Paths | `apps/wedding/**`, `packages/**`, `package.json`, `bun.lock`, `turbo.json`, `.dockerignore` |
   | Build-time Arguments | `NEXT_PUBLIC_SITE_URL=https://wedding.lilispics.com` (+ the three Supabase public vars) |
   | Environment | same values as the build args |
   | Domain | `wedding.lilispics.com`, `/`, port `3000`, HTTPS, Let's Encrypt |

3. Deploy. Check `https://wedding.lilispics.com/` and `/fr` → 200, and
   `robots.txt` → `Disallow: /`.

---

## Definition of done

- [ ] `apps/wedding` builds and runs on 3052 with EN and FR placeholder pages.
- [ ] noindex via both the `robots` metadata and `robots.txt`.
- [ ] Messages at key parity.
- [ ] Dockerfile present. Dokploy deployment done or explicitly deferred.
- [ ] No wedding *features* added.
- [ ] Commit(s) made. Phase report delivered. STOP.
