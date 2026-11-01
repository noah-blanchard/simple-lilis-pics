# Phase 04: `@lili/ui` (shared components, hooks, icons, CSS tokens)

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Extract into `@lili/ui` everything presentational that **both** the public
site and the admin need, plus the design tokens. After this phase, `apps/admin`
(phase 05) and `apps/wedding` (phase 08) can import the same components and
the same Tailwind theme.

Runtime behavior and visuals must be **identical**. The only intentional code
change is that `LinksPageContent` loses its dependency on the app-specific
`@/i18n/navigation` (explained in step 4).

## Preconditions

- [ ] Phase 03 is committed, and build passes from the root.
- [ ] Branch `refactor/monorepo`, clean tree, `master` not ahead (README §8).
- [ ] Lockfile snapshot taken (README §7.3).

## Out of scope

- Admin-only components (`src/components/admin/**`): they move to
  `apps/admin` in phase 05, unchanged.
- Public-only components (sections, menus, gallery, etc.): they stay in
  `apps/web`.
- Fonts (`src/lib/fonts.ts`): each app keeps its own `next/font` declarations
  (phase 05 copies the file to admin). `next/font` calls stay in app code on
  purpose.
- Any styling or animation change.

---

## Step 1: Read the docs

- Tailwind CSS 4 `@source` and `@import`. Use your knowledge of v4. The
  installed version is in `node_modules/tailwindcss/package.json`.
- Next: `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/transpilePackages.md`.

## Step 2: Create `packages/ui`

`packages/ui/package.json`. Copy version ranges **exactly** from
`apps/web/package.json` if they differ from the ones shown:

```json
{
  "name": "@lili/ui",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./components/*": "./src/components/*.tsx",
    "./links/*": "./src/links/*.tsx",
    "./lib/*": "./src/lib/*.ts",
    "./types": "./src/types.ts",
    "./styles/*": "./src/styles/*"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@lili/core": "workspace:*",
    "motion": "^12.40.0",
    "react-icons": "^5.7.0"
  },
  "peerDependencies": {
    "next": "16.2.7",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@lili/config": "workspace:*",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  }
}
```

`packages/ui/tsconfig.json`:

```json
{
  "extends": "@lili/config/tsconfig.base.json",
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

## Step 3: Move files with `git mv`

From the repo root:

```bash
mkdir -p packages/ui/src/{components/rate,components/links,lib,links,styles}

git mv apps/web/src/components/PillButton.tsx          packages/ui/src/components/PillButton.tsx
git mv apps/web/src/components/Icons.tsx               packages/ui/src/components/Icons.tsx
git mv apps/web/src/components/ZoomableImage.tsx       packages/ui/src/components/ZoomableImage.tsx
git mv apps/web/src/components/NeonRotatingBorder.tsx  packages/ui/src/components/NeonRotatingBorder.tsx
git mv apps/web/src/components/rate/StarIcon.tsx       packages/ui/src/components/rate/StarIcon.tsx
git mv apps/web/src/components/links/LinksPageContent.tsx packages/ui/src/components/links/LinksPageContent.tsx
git mv apps/web/src/components/links/LinkCard.tsx      packages/ui/src/components/links/LinkCard.tsx
git mv apps/web/src/components/links/SocialLinks.tsx   packages/ui/src/components/links/SocialLinks.tsx
git mv apps/web/src/lib/motion.ts                      packages/ui/src/lib/motion.ts
git mv apps/web/src/lib/ui.ts                          packages/ui/src/lib/ui.ts
git mv apps/web/src/lib/bento.ts                       packages/ui/src/lib/bento.ts
git mv apps/web/src/lib/use-media-query.ts             packages/ui/src/lib/use-media-query.ts
git mv apps/web/src/lib/links/icons.tsx                packages/ui/src/links/icons.tsx
git mv apps/web/src/lib/links/social-icons.tsx         packages/ui/src/links/social-icons.tsx
git mv apps/web/src/styles/theme.css                   packages/ui/src/styles/theme.css
```

Why these files: they are exactly the non-admin modules that the admin
imports today (`PillButton`, `Icons`, `ZoomableImage`, `NeonRotatingBorder`,
`rate/StarIcon`, `links/*`, `lib/motion`, `lib/ui`, `lib/bento`,
`lib/use-media-query`, the link and social icon maps), plus the theme tokens
that every app needs.

## Step 4: Fix imports inside the moved files

Inside `packages/ui`, use relative imports for same-package modules and
`@lili/core/...` for core. Complete list:

| File (under `packages/ui/src/`) | Old specifier | New specifier |
| --- | --- | --- |
| `components/PillButton.tsx` | `@/lib/motion` | `../lib/motion` |
| `components/PillButton.tsx` | `@/types` | `../types` |
| `components/Icons.tsx` | `@/types` | `../types` |
| `components/ZoomableImage.tsx` | `@/lib/motion` | `../lib/motion` |
| `components/links/LinksPageContent.tsx` | `@/lib/motion` | `../../lib/motion` |
| `components/links/LinksPageContent.tsx` | `@/i18n/navigation` | **removed, see 4b** |
| `components/links/LinkCard.tsx` | `@/lib/links/icons` | `../../links/icons` |
| `components/links/SocialLinks.tsx` | `@/lib/links/social-icons` | `../../links/social-icons` |
| `components/links/SocialLinks.tsx` | `@/lib/motion` | `../../lib/motion` |

These already point at core from phase 02 and stay unchanged:
`@lili/core/i18n/routing`, `@lili/core/types/db`, `@lili/core/links/constants`.
These relative imports are already correct: `./LinkCard`, `./SocialLinks`.

### 4a. Create `packages/ui/src/types.ts`

Move the two UI-only types out of `apps/web/src/types/index.ts`. Cut these
declarations, including their doc comments if any, from that file:

```ts
export type IconKind =
  | "landscape"
  | "street"
  | "portrait"
  | "fashion"
  | "event";

export type PillVariant = "light" | "dark" | "accent" | "ghost" | "danger";
```

Put them in `packages/ui/src/types.ts`:

```ts
/** UI-level shared types used by @lili/ui components. */

export type IconKind =
  | "landscape"
  | "street"
  | "portrait"
  | "fashion"
  | "event";

export type PillVariant = "light" | "dark" | "accent" | "ghost" | "danger";
```

Then, at the top of `apps/web/src/types/index.ts` (after its file comment),
add a re-export so existing `@/types` imports in the web app keep working:

```ts
export type { IconKind, PillVariant } from "@lili/ui/types";
```

(This app-level re-export is allowed; the "no barrels" rule applies to
packages.)

### 4b. Decouple `LinksPageContent` from the web app's i18n navigation

`LinksPageContent` imports `Link` from `@/i18n/navigation`, which only exists
in `apps/web`. In public mode it renders a "back home" link. In editor mode
(admin preview) it renders a `<span>` instead.

Change it to take the already-localized home URL as a prop and render a plain
`next/link`:

1. Replace `import { Link } from "@/i18n/navigation";` with
   `import NextLink from "next/link";`.
2. In `interface LinksPageContentProps`, add after `backHomeLabel?: string;`:

   ```ts
   /** Locale-resolved home URL for the public "back" link (e.g. "/" or "/fr").
    *  Ignored in editor mode. */
   homeHref?: string;
   ```

3. In the destructured props, add `homeHref = "/",` next to `backHomeLabel`.
4. In the JSX, replace `<Link href="/" …>` … `</Link>` with
   `<NextLink href={homeHref} …>` … `</NextLink>`. Keep every other attribute
   and child identical.

Then update the **only public caller**, `apps/web/src/app/[locale]/links/page.tsx`:

1. Add `import { getPathname } from "@/i18n/navigation";`.
2. On `<LinksPageContent …>`, add the prop:

   ```tsx
   homeHref={getPathname({ href: "/", locale: locale as Locale })}
   ```

With `localePrefix: "as-needed"`, this yields `/` for `en` and `/fr` for
`fr`, the same URLs the next-intl `Link` produced. The admin editor caller
(`LinksEditor.tsx`) needs no change because the prop is optional and unused in
editor mode.

Check the next-intl v4 `getPathname` signature in
`node_modules/next-intl/dist/types/navigation/react-server/createNavigation.d.ts`
(or the nearest `.d.ts`) before using it. If its argument shape differs, adapt
the call and report.

## Step 5: Create `packages/ui/src/styles/base.css`

Take `apps/web/src/app/globals.css`. Everything **after** its first two lines
(`@import "tailwindcss";` and `@import "../styles/theme.css";`) becomes
`packages/ui/src/styles/base.css`, verbatim. That covers the `@theme inline`
block, the fluid `@theme` block, `:root`, both `@utility` blocks, `html, body`,
`::selection`, `:focus-visible`, `.display`, `.display-xl`, `.tag-mono`,
`.no-scrollbar`, `.grain`, `.no-save`, `.wm-text`, and all comments.

Prefer `git mv` for history: move `globals.css` to `base.css`, delete the
two import lines from `base.css`, then create a fresh `globals.css`:

```bash
git mv apps/web/src/app/globals.css packages/ui/src/styles/base.css
# edit base.css: delete the first two @import lines (and any blank line left at the top)
```

Add this header comment at the top of `base.css`:

```css
/* Shared base styles for every Lilis Pics app. Imported by each app's
   globals.css AFTER `@import "tailwindcss"` and theme.css. Tailwind v4 inlines
   @imports, so @theme/@utility here behave exactly as if written in the app. */
```

## Step 6: New `apps/web/src/app/globals.css`

```css
@import "tailwindcss";
@import "@lili/ui/styles/theme.css";
@import "@lili/ui/styles/base.css";

/* Shared components live in packages/ui, outside this app's folder. Tailwind
   does not scan outside the app by default, so register it explicitly
   (path is relative to this file). */
@source "../../../../packages/ui/src";
```

Path check: `apps/web/src/app/` → `../` = `apps/web/src`, `../../` =
`apps/web`, `../../../` = `apps`, `../../../../` = repo root. So the target is
`<root>/packages/ui/src`. ✓

**Fallback if the bare `@lili/ui/...` CSS imports fail to resolve** (build
error like "Can't resolve '@lili/ui/styles/theme.css'"): use relative paths
instead and report it.

```css
@import "../../../../packages/ui/src/styles/theme.css";
@import "../../../../packages/ui/src/styles/base.css";
```

The three layouts that import `globals.css` (`[locale]/layout.tsx`,
`(admin)/layout.tsx`, `(rate)/rate/[locale]/layout.tsx`) keep their imports
unchanged.

Also update the stale comment at the top of `packages/ui/src/styles/theme.css`
that says tokens are bound "via `@theme inline` in globals.css". Change it to
"in base.css". This is the only allowed edit to `theme.css`; **no color value
changes**.

## Step 7: Rewrite imports in `apps/web`

Alias imports (Git Bash, repo root):

```bash
files=$(git grep -lE '"@/(components/(PillButton|Icons|ZoomableImage|NeonRotatingBorder|rate/StarIcon|links/(LinksPageContent|LinkCard|SocialLinks))|lib/(motion|ui|bento|use-media-query|links/icons|links/social-icons))"' -- apps/web)
echo "$files"
sed -i -E \
  -e 's#"@/components/(PillButton|Icons|ZoomableImage|NeonRotatingBorder)"#"@lili/ui/components/\1"#g' \
  -e 's#"@/components/rate/StarIcon"#"@lili/ui/components/rate/StarIcon"#g' \
  -e 's#"@/components/links/(LinksPageContent|LinkCard|SocialLinks)"#"@lili/ui/components/links/\1"#g' \
  -e 's#"@/lib/(motion|ui|bento|use-media-query)"#"@lili/ui/lib/\1"#g' \
  -e 's#"@/lib/links/(icons|social-icons)"#"@lili/ui/links/\1"#g' \
  $files
```

**Relative** imports of moved files (verified list, paths under
`apps/web/src/components/`). Fix by hand:

| File | Old | New |
| --- | --- | --- |
| `ContactForm.tsx` | `./NeonRotatingBorder` | `@lili/ui/components/NeonRotatingBorder` |
| `ContactForm.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `ContactSuccess.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `FooterContactCta.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `MenuToggle.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `NavIndexList.tsx` | `./Icons` | `@lili/ui/components/Icons` |
| `PriceCard.tsx` | `./Icons` | `@lili/ui/components/Icons` |
| `PriceCard.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `ProjectGallery.tsx` | `./Icons` | `@lili/ui/components/Icons` |
| `ProjectGallery.tsx` | `./PillButton` | `@lili/ui/components/PillButton` |
| `ReviewCard.tsx` | `./Icons` | `@lili/ui/components/Icons` |
| `SpecialtyCard.tsx` | `./Icons` | `@lili/ui/components/Icons` |
| `admin/LinksEditor.tsx` | `../PillButton` | `@lili/ui/components/PillButton` |
| `rate/RateExperience.tsx` | `../PillButton` | `@lili/ui/components/PillButton` |
| `rate/RateExpired.tsx` | `../PillButton` | `@lili/ui/components/PillButton` |
| `rate/RateExpired.tsx` | `./StarIcon` | `@lili/ui/components/rate/StarIcon` |
| `rate/RateSuccess.tsx` | `../PillButton` | `@lili/ui/components/PillButton` |
| `rate/RateSuccess.tsx` | `./StarIcon` | `@lili/ui/components/rate/StarIcon` |
| `rate/StarRating.tsx` | `./StarIcon` | `@lili/ui/components/rate/StarIcon` |
| `rate/ThankYouLetter.tsx` | `../PillButton` | `@lili/ui/components/PillButton` |

Verify nothing points at a moved path any more:

```bash
git grep -nE '"@/(components/(PillButton|Icons|ZoomableImage|NeonRotatingBorder|rate/StarIcon|links/)|lib/(motion|ui|bento|use-media-query|links/))' -- apps/web     # empty
git grep -nE 'from "\.{1,2}/([^"]*/)?(PillButton|Icons|ZoomableImage|NeonRotatingBorder|StarIcon|LinksPageContent|LinkCard|SocialLinks)"' -- apps/web   # empty
git grep -n '"@/' -- packages/                                                       # empty
git grep -n '@lili/ui' -- packages/core/                                             # empty
```

`apps/web/src/components/links/` and `apps/web/src/lib/links/` should now
be empty directories. Git doesn't track empty directories, so nothing to do.

## Step 8: Register the package

1. `apps/web/package.json` → `dependencies`: add `"@lili/ui": "workspace:*"`.
2. `apps/web/next.config.ts`:
   `transpilePackages: ["@lili/core", "@lili/ui"]`.
3. `bun install`, then the lockfile guard (README §7.3) and the duplicate
   React check from phase 02 step B7 (also for `packages/ui/node_modules`).

## Step 9: Verify

```bash
bun run lint
bun run typecheck      # @lili/core, @lili/ui, @lili/web
bun run build
```

**Visual regression check (important).** Tailwind classes that appear *only*
inside the moved components (e.g. PillButton variants, LinkCard styles,
ZoomableImage overlay) disappear silently if `@source` is wrong. Run
`bun run dev:web` and compare against production (`https://lilispics.com`)
or a `master` checkout:

- Home page: pill buttons (all variants visible on the page), icons in the
  specialty cards and price cards, contact form neon border.
- `/links` and `/fr/links`: banner, link cards, social icons, and the "back
  home" link goes to `/` and `/fr` respectively.
- `/portfolio/<id>`: zoomable image overlay.
- `/rate/en/AAAAAAAAAA`: expired view with the star icon and pill button.
- 🧑 Operator, logged in: `/admin/links` preview renders identically
  (fonts, banner, cards); `/admin/featured` bento editor lays out
  correctly (uses `lib/bento`); `/admin` login form field styling (uses
  `lib/ui`).

Programmatic sanity check of the generated CSS (agent can do this after
`bun run build`):

```bash
# a class that is used only inside packages/ui must exist in the built CSS
grep -l "rounded-full" apps/web/.next/static/chunks/*.css apps/web/.next/static/css/*.css 2>/dev/null | head -1
```

(Pick one or two distinctive classes from `PillButton.tsx` and grep for them.
Exact chunk paths vary. Report what you checked.)

## Step 10: Commit

```text
Extract shared UI, hooks and theme tokens into @lili/ui

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

---

## Definition of done

- [ ] `packages/ui/src` contains the 15 moved files plus `types.ts` and
      `styles/base.css`.
- [ ] `apps/web/src/app/globals.css` is the 3-import + `@source` file.
- [ ] `LinksPageContent` takes `homeHref`, and the public links page passes
      the localized home path.
- [ ] No moved module is imported by an old path, and the structural greps
      are clean.
- [ ] Lint, typecheck and build pass. Visual check done (operator part listed
      in the report).
- [ ] Commit made. Phase report delivered. STOP.
