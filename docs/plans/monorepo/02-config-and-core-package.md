# Phase 02: `@lili/config` and `@lili/core`

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

1. Create `@lili/config` with shared TypeScript bases, and make `apps/web`
   extend them.
2. Extract every **non-UI, framework-light shared module** from `apps/web/src`
   into `@lili/core`, then point `apps/web` at the package.

Runtime behavior must be identical. Route handlers stay in `apps/web/src/app/api`
for now (phase 03 moves their logic).

## Preconditions

- [ ] Phase 01 is committed. `bun run build` passes from the root.
- [ ] Branch `refactor/monorepo`, clean tree, no new commits on `master`
      (README §8).
- [ ] Lockfile snapshot taken (README §7.3).

## Out of scope

- UI components, hooks, CSS (phase 04).
- Route handler logic (phase 03).
- Removing now-unused dependencies from `apps/web/package.json` (phase 05).
- Any behavior change.

---

## Part A: `@lili/config`

### A1. Create `packages/config/package.json`

```json
{
  "name": "@lili/config",
  "version": "0.0.0",
  "private": true
}
```

Do **not** add an `exports` field. TypeScript's `extends` resolves
`@lili/config/<file>.json` as a plain file path.

### A2. Create `packages/config/tsconfig.base.json`

These are exactly the current compiler options of `apps/web/tsconfig.json`,
minus `plugins` and `paths`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true
  }
}
```

### A3. Create `packages/config/tsconfig.nextjs.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }]
  }
}
```

### A4. Replace `apps/web/tsconfig.json`

```json
{
  "extends": "@lili/config/tsconfig.nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

`paths` and `include` must stay in the app file because they resolve relative
to the file that declares them.

### A5. Wire the dependency

Add to `apps/web/package.json` `devDependencies`:

```json
"@lili/config": "workspace:*"
```

Run `bun install`, then `bun run typecheck` and `bun run build`. If Next.js
prints that it **modified** `tsconfig.json` during build, accept the change
only if it adds settings. If it rewrites the file to drop `extends`, STOP and
report.

Commit:

```text
Share TypeScript settings through @lili/config

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Part B: `@lili/core`

### B1. Create `packages/core/package.json`

Copy the version ranges **exactly** from `apps/web/package.json`. The values
below match the code on 2026-11-01. If any range in `apps/web/package.json`
differs, use the one from `apps/web/package.json`.

```json
{
  "name": "@lili/core",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./*": "./src/*.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@openrouter/sdk": "^0.12.79",
    "@supabase/ssr": "^0.10.3",
    "@supabase/supabase-js": "^2.107.0",
    "next-intl": "^4.13.0",
    "resend": "^6.18.0",
    "zod": "^4.4.3"
  },
  "peerDependencies": {
    "next": "16.2.7",
    "react": "19.2.4"
  },
  "devDependencies": {
    "@lili/config": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^19",
    "typescript": "^5"
  }
}
```

Every module in `@lili/core` is a `.ts` file (no `.tsx`), so the single
wildcard export covers them all: `@lili/core/api/response` →
`packages/core/src/api/response.ts`.

### B2. Create `packages/core/tsconfig.json`

```json
{
  "extends": "@lili/config/tsconfig.base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### B3. Move files with `git mv`

Run from the repo root:

```bash
mkdir -p packages/core/src/{supabase,api,links,mail,translate,data,types,i18n}

git mv apps/web/src/lib/env.ts                 packages/core/src/env.ts
git mv apps/web/src/lib/supabase/admin.ts      packages/core/src/supabase/admin.ts
git mv apps/web/src/lib/supabase/browser.ts    packages/core/src/supabase/browser.ts
git mv apps/web/src/lib/supabase/public.ts     packages/core/src/supabase/public.ts
git mv apps/web/src/lib/supabase/server.ts     packages/core/src/supabase/server.ts
git mv apps/web/src/lib/api/client.ts          packages/core/src/api/client.ts
git mv apps/web/src/lib/api/response.ts        packages/core/src/api/response.ts
git mv apps/web/src/lib/api/schemas.ts         packages/core/src/api/schemas.ts
git mv apps/web/src/lib/api/validate.ts        packages/core/src/api/validate.ts
git mv apps/web/src/lib/api/with-auth.ts       packages/core/src/api/with-auth.ts
git mv apps/web/src/lib/rating.ts              packages/core/src/rating.ts
git mv apps/web/src/lib/slugify.ts             packages/core/src/slugify.ts
git mv apps/web/src/lib/links/constants.ts     packages/core/src/links/constants.ts
git mv apps/web/src/lib/mail/resend.ts         packages/core/src/mail/resend.ts
git mv apps/web/src/lib/mail/templates.ts      packages/core/src/mail/templates.ts
git mv apps/web/src/lib/translate/openrouter.ts packages/core/src/translate/openrouter.ts
git mv apps/web/src/lib/translate/prompts.ts   packages/core/src/translate/prompts.ts
git mv apps/web/src/lib/data/links.ts          packages/core/src/data/links.ts
git mv apps/web/src/lib/data/parse.ts          packages/core/src/data/parse.ts
git mv apps/web/src/lib/data/projects.ts       packages/core/src/data/projects.ts
git mv apps/web/src/lib/data/ratings.ts        packages/core/src/data/ratings.ts
git mv apps/web/src/types/db.ts                packages/core/src/types/db.ts
git mv apps/web/src/i18n/routing.ts            packages/core/src/i18n/routing.ts
```

**These stay in `apps/web` on purpose:**

- `src/lib/translate/use-translate.ts`: admin-only client hook (moves to
  admin in phase 05).
- `src/lib/links/icons.tsx`, `src/lib/links/social-icons.tsx`: React icon
  maps (move to `@lili/ui` in phase 04).
- `src/lib/{motion,ui,bento,use-media-query}.ts`: UI (phase 04).
- `src/lib/{fonts,messages,navTarget}.ts`, `src/lib/admin/`: app-specific.
- `src/types/index.ts`: marketing view types (stay in web; phase 04 moves two
  UI types out).
- `src/i18n/request.ts`, `src/i18n/navigation.ts`: next-intl app wiring.

### B4. Fix imports *inside* the moved files (relative imports only)

Inside `packages/core`, replace every `@/…` import with a relative path. This
is the complete list. Apply exactly:

| File (under `packages/core/src/`) | Old specifier | New specifier |
| --- | --- | --- |
| `supabase/admin.ts` | `@/lib/env` | `../env` |
| `supabase/browser.ts` | `@/lib/env` | `../env` |
| `supabase/public.ts` | `@/lib/env` | `../env` |
| `supabase/server.ts` | `@/lib/env` | `../env` |
| `api/schemas.ts` | `@/lib/links/constants` | `../links/constants` |
| `api/with-auth.ts` | `@/lib/supabase/server` | `../supabase/server` |
| `rating.ts` | `@/i18n/routing` | `./i18n/routing` |
| `mail/resend.ts` | `@/lib/api/schemas` | `../api/schemas` |
| `mail/templates.ts` | `@/lib/api/schemas` | `../api/schemas` |
| `translate/openrouter.ts` | `@/lib/api/schemas` | `../api/schemas` |
| `translate/prompts.ts` | `@/lib/api/schemas` | `../api/schemas` |
| `data/links.ts` | `@/i18n/routing` | `../i18n/routing` |
| `data/links.ts` | `@/lib/api/schemas` | `../api/schemas` |
| `data/links.ts` | `@/lib/links/constants` | `../links/constants` |
| `data/links.ts` | `@/lib/supabase/public` | `../supabase/public` |
| `data/links.ts` | `@/types/db` (2 imports) | `../types/db` |
| `data/parse.ts` | `@/types/db` | `../types/db` |
| `data/projects.ts` | `@/i18n/routing` | `../i18n/routing` |
| `data/projects.ts` | `@/lib/data/parse` | `./parse` |
| `data/projects.ts` | `@/lib/supabase/server` | `../supabase/server` |
| `data/projects.ts` | `@/types/db` | `../types/db` |
| `data/ratings.ts` | `@/lib/supabase/server` | `../supabase/server` |
| `data/ratings.ts` | `@/types/db` | `../types/db` |
| `types/db.ts` | `@/i18n/routing` | `../i18n/routing` |
| `types/db.ts` | `@/lib/env` | `../env` |
| `types/db.ts` | `@/lib/links/constants` | `../links/constants` |

Existing relative imports (`./response`, `./templates`, `./prompts`) are
already correct. Then verify:

```bash
git grep -n '"@/' -- packages/     # must print nothing
```

Comments that mention old paths (e.g. `@/types/db` in a doc comment) may stay.
Only import specifiers matter.

### B5. Rewrite imports in `apps/web` to the package

Every `apps/web` import of a moved module now uses `@lili/core/...`. Run this
from the repo root in **Git Bash** (or do the same with the editor's
search-and-replace). The patterns include the closing quote, so modules that
did *not* move (`@/lib/links/icons`, `@/lib/translate/use-translate`) are
untouched:

```bash
files=$(git grep -lE '"@/(lib/(env|rating|slugify|links/constants|api/|supabase/|mail/|data/|translate/(openrouter|prompts)")|types/db"|i18n/routing")' -- apps/web)
echo "$files"
sed -i -E \
  -e 's#"@/lib/env"#"@lili/core/env"#g' \
  -e 's#"@/lib/rating"#"@lili/core/rating"#g' \
  -e 's#"@/lib/slugify"#"@lili/core/slugify"#g' \
  -e 's#"@/lib/links/constants"#"@lili/core/links/constants"#g' \
  -e 's#"@/lib/api/(client|response|schemas|validate|with-auth)"#"@lili/core/api/\1"#g' \
  -e 's#"@/lib/supabase/(admin|browser|public|server)"#"@lili/core/supabase/\1"#g' \
  -e 's#"@/lib/mail/(resend|templates)"#"@lili/core/mail/\1"#g' \
  -e 's#"@/lib/data/(links|parse|projects|ratings)"#"@lili/core/data/\1"#g' \
  -e 's#"@/lib/translate/(openrouter|prompts)"#"@lili/core/translate/\1"#g' \
  -e 's#"@/types/db"#"@lili/core/types/db"#g' \
  -e 's#"@/i18n/routing"#"@lili/core/i18n/routing"#g' \
  $files
```

Then fix the two **relative** imports of the moved routing file by hand:

| File | Old | New |
| --- | --- | --- |
| `apps/web/src/i18n/request.ts` | `import { routing } from "./routing";` | `import { routing } from "@lili/core/i18n/routing";` |
| `apps/web/src/i18n/navigation.ts` | `import { routing } from "./routing";` | `import { routing } from "@lili/core/i18n/routing";` |

Verify that nothing still points at a moved module:

```bash
git grep -nE '"@/(lib/(env|rating|slugify|links/constants|api/|supabase/|mail/|data/)|types/db"|i18n/routing")' -- apps/web   # must print nothing
git grep -nE '"@/lib/translate/(openrouter|prompts)"' -- apps/web                                                     # must print nothing
git grep -nE 'from "\./routing"' -- apps/web                                                                           # must print nothing
```

### B6. Register the package in the app

1. `apps/web/package.json` → `dependencies`: add `"@lili/core": "workspace:*"`.
   Keep every existing dependency (cleanup is phase 05).
2. `apps/web/next.config.ts`: add `transpilePackages` to the config object.
   Leave everything else as it is:

   ```ts
   const nextConfig: NextConfig = {
     transpilePackages: ["@lili/core"],
     images: {
       // …unchanged…
     },
   };
   ```

   (Read `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/transpilePackages.md`
   first, per AGENTS.md.)

### B7. Install and check for duplicate React/Next

```bash
bun install
```

Lockfile guard (README §7.3). Then confirm there is exactly one copy of
`react`, `react-dom` and `next`:

```bash
ls node_modules/react/package.json node_modules/next/package.json
ls apps/web/node_modules/react packages/core/node_modules/react 2>/dev/null   # expect: nothing
ls apps/web/node_modules/next  packages/core/node_modules/next  2>/dev/null   # expect: nothing
```

If a nested copy exists, STOP and report. Duplicate React causes "Invalid hook
call" errors at runtime.

### B8. Verify

```bash
bun run lint
bun run typecheck      # now runs @lili/core and @lili/web
bun run build
git grep -n '"@/' -- packages/    # empty
```

Typecheck notes:

- `packages/core` uses `import "server-only"`, a side-effect import that
  TypeScript doesn't resolve. That's expected and identical to before.
- If `packages/core` typecheck fails on `next/headers`, `next/cache` or
  `react` types, check that `next` and `@types/react` are hoisted to the root
  `node_modules`, and report.

Build notes: a build error mentioning **"server-only"** in a client
component means a client file imports a server module. Today only these core
modules are imported from client components: `api/client`, `api/schemas`,
`rating`, `links/constants`, `types/db` (types and `resolveImageUrl`), and
`i18n/routing`. None of them imports `server-only`. If the error appears,
report the import chain shown by Next.

Dev smoke test (agent if authorized, otherwise the operator), `bun run dev:web`:

- `/`, `/fr`, `/portfolio`, a project detail page, `/links`, `/fr/links`,
  `/sitemap.xml` → 200, images visible.
- `/rate/en/AAAAAAAAAA` → 200 and renders the "expired / invalid" view.
  Read-only check of the token lookup.
- `/admin` → redirect to `/login`.
- 🧑 Operator: log in, open each admin section once (projects, featured,
  ratings, messages, links). Lists load and nothing is saved.

### B9. Commit

```text
Extract shared backend modules into @lili/core

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

Confirm renames with `git show --stat HEAD`.

---

## Definition of done

- [ ] `packages/config` has `package.json`, `tsconfig.base.json` and
      `tsconfig.nextjs.json`, and `apps/web/tsconfig.json` extends the latter.
- [ ] `packages/core/src` contains exactly the 23 moved files, with only
      relative internal imports.
- [ ] `apps/web` imports them through `@lili/core/...`, and
      `transpilePackages: ["@lili/core"]` is set.
- [ ] Single copies of react, react-dom and next.
- [ ] Lint, typecheck and build pass. Smoke test passes.
- [ ] Two commits (Part A, Part B). Phase report delivered. STOP.
