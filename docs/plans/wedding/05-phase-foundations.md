# Phase 05: Foundations

> Read [`README.md`](README.md) first. This phase assumes its golden rules and
> its "how to run a phase" loop.

## Goal

Give `apps/wedding` everything later phases build on:

- the approved dependencies;
- the four lilispics.com components moved into `@lili/ui`, so both apps share them;
- the wedding tokens;
- the fonts without mono;
- formatting and motion helpers;
- the six layout primitives;
- placeholder photographs;
- a dev-only kit page that shows all of the above in both tones.

The portfolio must look and behave **exactly** as before.

**Out of scope:** any real page section, the menu, the footer, the database.

## Preconditions

- [ ] Branch `feat/wedding-design`, clean tree (`git status`).
- [ ] Note the current `bun.lock` hash: `git log -1 --format=%h -- bun.lock`.
- [ ] `bun run build` passes on the current tree. If it does not, stop and report.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) §3–§5, §7, §9
- `apps/web/src/components/{WaxSeal,Reveal,AccentUnderline,SectionHeader}.tsx`
- `apps/web/src/sections/Hero.tsx` (the `renderAccentLine` helper at line 19)
- `packages/ui/package.json` (`exports`), `packages/ui/src/lib/motion.ts`
- `apps/wedding/src/lib/fonts.ts`, `apps/wedding/src/app/globals.css`, `apps/wedding/src/app/[locale]/layout.tsx`
- `apps/web/node_modules/next/dist/docs/` → the `next/image` guide (static imports, `sizes`)

---

## Part A: Dependencies

### A1. `apps/wedding/package.json`

Add to `dependencies`, with exactly these ranges (they match `apps/web/package.json`):

```json
"@hookform/resolvers": "^5.4.0",
"motion": "^12.40.0",
"react-hook-form": "^7.77.0",
"zod": "^4.4.3"
```

Keep the keys alphabetical, as Biome expects.

### A2. Install and check the lockfile

```bash
bun install
git diff --stat bun.lock
git diff bun.lock | grep '^[-+]' | grep -v '^[-+][-+]' | head -40
```

The diff may only add the four names under the `apps/wedding` workspace entry.
If any installed version line changes, stop: run `git checkout bun.lock` and report.

---

## Part B: Move four components to `@lili/ui`

`WaxSeal`, `Reveal`, `AccentUnderline` and `SectionHeader` contain no app imports, so they belong in
`@lili/ui` (AGENTS.md §4). Moving them with `git mv` keeps their history.

### B1. Move

```bash
git mv apps/web/src/components/WaxSeal.tsx         packages/ui/src/components/WaxSeal.tsx
git mv apps/web/src/components/Reveal.tsx          packages/ui/src/components/Reveal.tsx
git mv apps/web/src/components/AccentUnderline.tsx packages/ui/src/components/AccentUnderline.tsx
git mv apps/web/src/components/SectionHeader.tsx   packages/ui/src/components/SectionHeader.tsx
```

### B2. Fix imports inside the moved files

Packages use relative imports and never `@/` (AGENTS.md §4):

- `Reveal.tsx`, `AccentUnderline.tsx`: change `@lili/ui/lib/motion` to `../lib/motion`.
- `SectionHeader.tsx`: already imports `./AccentUnderline` and `./Reveal`. Keep it that way.
- `SectionHeader` is a Server Component that renders two Client Components. That is fine as it is.

### B3. Two backward-compatible props

**`WaxSeal`**: add an optional `logoSrc` prop (default `"/logo.webp"`) and use it for the
`<Image src>`. Each app serves its own copy of the logo from `public/`.

**`SectionHeader`**: add `as?: "h1" | "h2"` (default `"h2"`) and an optional `id`
(for `aria-labelledby`). Render the heading with that tag:

```tsx
interface SectionHeaderProps {
  titleBase: string;
  titleAccent: string;
  align?: "center" | "left";
  /** Heading level; pages whose main title is a section header pass "h1". */
  as?: "h1" | "h2";
  /** Id on the heading, for a section's aria-labelledby. */
  id?: string;
  className?: string;
}

export const SectionHeader = ({ titleBase, titleAccent, align = "center", as: Heading = "h2", id, className = "" }: SectionHeaderProps) => (
  <div className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Reveal delay={0.08}>
      <Heading id={id} className={`display ${align === "center" ? "mx-auto" : ""} max-w-5xl text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-[68px] min-[1440px]:text-h2-fluid`} style={{ textWrap: "balance" }}>
        <span className="block">{titleBase}</span>
        <AccentUnderline block className="text-accent italic">{titleAccent}</AccentUnderline>
      </Heading>
    </Reveal>
  </div>
);
```

With `align="left"`, the original `mx-auto` kept a left-aligned heading's box centred. Applying
`mx-auto` only when centred fixes that and does not change any portfolio usage, because the portfolio only uses `center`.

### B4. Update every `apps/web` import

These files import the moved components. Switch each to
`@lili/ui/components/<Name>` and leave everything else untouched.

- `apps/web/src/components/ContactSuccess.tsx` (`WaxSeal`, `WAX_COLOR`)
- `apps/web/src/components/rate/ThankYouLetter.tsx` (`WaxSeal`)
- `apps/web/src/sections/{About,Contact,Featured,Footer,PortfolioBento,Pricing,Process,Specialty,Testimonials}.tsx`

Check that nothing is left behind:

```bash
rg -n "components/(WaxSeal|Reveal|AccentUnderline|SectionHeader)\"|\./(WaxSeal|Reveal|AccentUnderline|SectionHeader)\"|\.\./WaxSeal\"" apps/web/src
```

The only acceptable output is nothing.

### B5. Tailwind scanning

The moved files now live under `packages/ui/src`, which every app's `globals.css`
already scans through `@source`. No change is needed. Still, check in the browser that the
portfolio's section headers keep their size and italic accent (Part H).

---

## Part C: Tokens and fonts

### C1. `apps/wedding/src/app/globals.css`

Keep the three imports and the `@source` line. Then paste the whole token block from
[`02-design-decisions.md`](02-design-decisions.md) §3 below them, unchanged.

### C2. `apps/wedding/src/lib/fonts.ts`

Remove `JetBrains_Mono` and its variable (D18). The file becomes:

```ts
import { Outfit, Playfair_Display } from "next/font/google";

// Same families and variables as the portfolio (apps/web/src/lib/fonts.ts);
// the wedding site drops the mono face because it never sets mono type.
const publicDisplay = Playfair_Display({ variable: "--font-display", subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], display: "swap" });
const publicSans = Outfit({ variable: "--font-sans-body", subsets: ["latin"], weight: ["300", "400", "500", "600"], display: "swap" });

export const publicFontVariables = `${publicDisplay.variable} ${publicSans.variable}`;
```

`latin` covers French accents. Weight 700 is dropped because the wedding site never uses it.

---

## Part D: Helpers

### D1. `apps/wedding/src/lib/format.ts`

```ts
import type { Locale } from "@lili/core/i18n/routing";

export type DayPart = "morning" | "afternoon" | "evening" | "night";
export type Season = "spring" | "summer" | "autumn" | "winter";

const NBSP = " ";

/** Minutes since midnight → "2:30 pm" (en) or "14 h 30" (fr, Québec usage).
 *  Minutes are always shown so the scroll clock keeps a constant width. */
export function formatTime(minutes: number, locale: Locale): string {
  const h = Math.floor(minutes / 60) % 24;
  const mm = String(minutes % 60).padStart(2, "0");
  if (locale === "fr") return `${h}${NBSP}h${NBSP}${mm}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm}${NBSP}${h < 12 ? "am" : "pm"}`;
}

/** Part of the day for the italic label beside the clock. */
export function dayPartOf(minutes: number): DayPart {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 18 * 60) return "afternoon";
  if (minutes < 22 * 60) return "evening";
  return "night";
}

/** Whole-dollar CAD price: "$3,200" (en-CA) or "3 200 $" (fr-CA). */
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Northern-hemisphere season of an ISO date ("2025-10-04" → "autumn"). */
export function seasonOf(isoDate: string): Season {
  const month = Number(isoDate.slice(5, 7));
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/** Long date for the privacy page and the postmark ("2 November 2026" / "2 novembre 2026"). */
export function formatLongDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Toronto" }).format(new Date(`${isoDate}T12:00:00`));
}
```

Check it with one command; the output must match the comments:

```bash
cd apps/wedding && bun -e 'import("./src/lib/format.ts").then(f=>console.log(f.formatTime(870,"en"),"|",f.formatTime(870,"fr"),"|",f.formatTime(1420,"en"),"|",f.formatPrice(3200,"en"),"|",f.formatPrice(3200,"fr"),"|",f.seasonOf("2025-10-04"),"|",f.dayPartOf(1170)))'
# expected: 2:30 pm | 14 h 30 | 11:40 pm | $3,200 | 3 200 $ | autumn | evening
```

### D2. `apps/wedding/src/lib/messages.ts`

Copy `apps/web/src/lib/messages.ts` (`rawList`), and add a generic typed reader next to it:

```ts
/** Read a raw structured message (array of objects). next-intl's `t.raw` is
 *  untyped, so the one unavoidable assertion lives here. */
export function rawItems<T>(t: { raw: (key: string) => unknown }, key: string): T[] {
  return t.raw(key) as T[];
}
```

### D3. `apps/wedding/src/lib/motion.ts`

```ts
import { EASE } from "@lili/ui/lib/motion";

// Wedding-only timings, all on the shared EASE (02-design-decisions §7).
export const FLASH_FROM = "brightness(2.6) contrast(0.7)";
export const FLASH_TO = "brightness(1) contrast(1)";
export const flashTransition = { duration: 0.6, ease: EASE } as const;

export const crossfadeTransition = { duration: 0.5, ease: EASE } as const;
export const disclosureTransition = { duration: 0.4, ease: EASE } as const;

/** Seal-the-reply sequence, seconds from success. */
export const SEAL = {
  cardIn: { duration: 0.5, ease: EASE },
  flap: { duration: 0.45, ease: EASE, delay: 0.5 },
  sealAt: 1.0,
  postmark: { duration: 0.3, ease: EASE, delay: 1.45 },
  copyAt: 1.7,
} as const;
```

---

## Part E: Primitives (`apps/wedding/src/components/`)

Write each primitive small and prop-driven, matching the comment density of
`apps/web/src/components`. The recipes come from `02-design-decisions.md` §5.

| File | Kind | Contract |
| --- | --- | --- |
| `Tone.tsx` | server | `{ tone: "day" \| "night"; as?: "section" \| "div" \| "footer" \| "header"; id?; className?; children; "aria-labelledby"? }`. Renders `<Tag data-tone={tone} className={tone === "day" ? "bg-ink text-fg …" : "…"}>`. The night colours come from the CSS scope, so it adds no colour classes for night |
| `Sheet.tsx` | server | `{ keyline?: boolean; className?; children; as?: "div" \| "article" \| "li" }`. Renders `data-tone="day" data-paper`, `relative rounded-[3px] bg-sheet text-fg shadow-[var(--shadow-sheet)]`, plus the keyline span `pointer-events-none absolute inset-[10px] rounded-[2px] border border-line` when `keyline` |
| `Photo.tsx` | client (it prevents the context menu) | `{ src: string \| StaticImageData; alt: string; ratio: "3/2" \| "2/3" \| "4/5" \| "16/9" \| "1/1"; sizes: string; priority?; className?; imgClassName? }`. An aspect box `relative overflow-hidden bg-panel` holding `next/image` with `fill`, `object-cover`, `no-save`, `draggable={false}`, `onContextMenu={e => e.preventDefault()}`. Use a `Record` from ratio to class (`aspect-[3/2]`, …) so Tailwind sees literal classes. `className` can override the ratio responsively, for example `md:aspect-[16/9]` |
| `Print.tsx` | server | `{ photo: PhotoProps; caption?: string; rotate?: number (deg, clamp ±2); className? }`. Renders `figure` → `bg-sheet p-[10px] pb-10 shadow-[var(--shadow-sheet)]`, then `Photo`, then `figcaption` (`absolute inset-x-3 bottom-2.5 truncate text-[14px] italic text-muted`). The rotation is an inline static `transform`, not animated |
| `TextLink.tsx` | client | `{ href?: string; external?: boolean; onClick?; pressed?: boolean; className?; children }`. With `href` starting with `/` or `#`, render `motion.create(Link)` from `@/i18n/navigation` (for `#` anchors on the same page, a plain `motion.a`). With `external`, render `motion.a target="_blank" rel="noopener noreferrer"`. With `onClick` and no `href`, render `motion.button type="button" aria-pressed={pressed}`. Base classes: `inline-block py-1 text-muted` (or `text-fg` when `pressed`). Hover: `whileHover={{ color: "var(--fg)" }}` with `hoverColorTransition`. No underline, no arrow |
| `Rule.tsx` | server | `{ short?: boolean; className? }` → `<span aria-hidden className={`mx-auto block h-px bg-line-strong ${short ? "w-[26px]" : "w-14"} ${className}`} />`. Use `className` only for margins |

Add `renderAccentLine` to `apps/wedding/src/lib/accent.tsx`, copied from
`apps/web/src/sections/Hero.tsx:19` (same `text-accent italic` span), and export it.

---

## Part F: Placeholder photographs

Until Lili supplies wedding photos, the wedding site uses her real portfolio images
(`03-guardrails.md` §3). Static imports give `next/image` the width, height and blur data.

### F1. Copy the files

```bash
mkdir -p apps/wedding/src/assets/placeholders apps/wedding/public
cp apps/web/public/logo.webp apps/wedding/public/logo.webp
cp apps/web/public/hero-carousel/portrait-photo-0{1,2,3,4,5}.webp apps/wedding/src/assets/placeholders/
cp apps/web/public/about/about_landscape.webp apps/wedding/src/assets/placeholders/landscape-01.webp
```

### F2. Look at every image

Open each of the six files with the Read tool (it displays images). For each one, note:
- the orientation;
- what is in it;
- whether it reads as day or as low light.

### F3. `apps/wedding/src/data/placeholder-photos.ts`

```ts
import type { StaticImageData } from "next/image";
import landscape01 from "@/assets/placeholders/landscape-01.webp";
import portrait01 from "@/assets/placeholders/portrait-photo-01.webp";
// … portrait02–05

/** Lili's own portfolio photographs, standing in for wedding photographs
 *  until real ones exist (docs/plans/wedding/README.md §5). Alt text
 *  describes what is actually in each image. */
export interface PlaceholderPhoto {
  src: StaticImageData;
  orientation: "landscape" | "portrait";
  alt: { en: string; fr: string };
}

export const PLACEHOLDERS = {
  landscape01: { src: landscape01, orientation: "landscape", alt: { en: "…", fr: "…" } },
  portrait01: { src: portrait01, orientation: "portrait", alt: { en: "…", fr: "…" } },
  // …
} satisfies Record<string, PlaceholderPhoto>;

export type PlaceholderKey = keyof typeof PLACEHOLDERS;

/** Where each placeholder is used. Swap keys here when real photos arrive. */
export const HERO_PHOTO: PlaceholderKey = "landscape01";
export const ABOUT_PORTRAIT: PlaceholderKey = "portrait05";
export const WORDS_PHOTOS: [PlaceholderKey, PlaceholderKey] = ["portrait03", "portrait04"];
```

- Choose the assignments after looking at the images. Put the darkest images in `WORDS_PHOTOS`, because they get the flash-develop effect.
- Write real alt text in both languages. Describe what is visible, without the banned words.
- Hour-by-hour assignments are added in phase 07 (`src/data/moments.ts`). Repeating a photo there is acceptable for placeholders.

If `@/assets/...webp` imports fail to typecheck, `next-env.d.ts` already references `next/image-types/global`. Check that it is present, and do not add a custom `*.d.ts`.

---

## Part G: Dev kit page

Create `apps/wedding/src/app/[locale]/kit/page.tsx`. It calls `notFound()` when
`process.env.NODE_ENV === "production"`, so it never ships. It shows:

1. A `Tone tone="day"` band:
   - `SectionHeader` (centred and `align="left"`);
   - a `Sheet keyline` holding a paragraph and a `PillButton variant="light"`;
   - a `Print` with a caption;
   - `TextLink` in all three modes;
   - `Rule`;
   - one `WaxSeal` (`className="h-16 w-16"`).
2. A `Tone tone="night"` band with the same set. The `Sheet` keeps paper colours on the table.
3. A line rendering every `formatTime` for the eight moment times in the current locale.

Plain, unstyled section labels are fine here. This page is a tool.

---

## Part H: Verification

1. From the root: `bun run lint`, `bun run typecheck`, `bun run build`. All three must pass.
2. Guardrail greps (`03-guardrails.md` §4). The scaffold `page.tsx` still contains `tag-mono` and `underline`. That is expected in this phase only and fixed in phase 06, so note it in the report.
3. **Portfolio regression.** Run `bun run dev:web` and open `http://localhost:3050`.
   - Screenshot the About, Process, Testimonials and Contact section headers.
   - Send nothing through the contact form. Instead, read `ContactSuccess.tsx` and check that it still imports the seal correctly.
   - Compare with `https://lilispics.com` at the same viewport. They must be identical.
4. **Kit page.** Run `bun run dev:wedding`, then open `http://localhost:3052/kit` and `/fr/kit` at 1440 and 390 pixels wide.
   - Day and night tokens apply.
   - The sheet on night stays white with dark text.
   - The focus ring inside the sheet is cyanotype (tab through it).
   - Night `PillButton` is a paper-white pill.
5. Answer the QA questions for the kit page (Q4–Q9 apply).

## Definition of done

- [ ] Four components live in `packages/ui/src/components/` and every `apps/web` import is updated. The portfolio is visually unchanged.
- [ ] The wedding app has the four new deps, the tokens, fonts without mono, `format.ts`, `messages.ts`, `motion.ts`, `accent.tsx`, the six primitives, placeholders with real alt text, and the dev kit page.
- [ ] `bun.lock` changes only by the four added names.
- [ ] Lint, typecheck and build pass.

## Commit message

```text
Lay the wedding site foundations

- Move WaxSeal, Reveal, AccentUnderline and SectionHeader into @lili/ui (portfolio unchanged)
- Add motion, react-hook-form, @hookform/resolvers and zod to the wedding app
- Add wedding tokens: paper sheet, cyanotype ink, night table scope
- Drop the mono face from the wedding fonts
- Add time, price and season formatting, motion timings and layout primitives
- Add placeholder photographs from the portfolio and a dev-only kit page
```
