# Phase 08: Home, the night half

> Read [`README.md`](README.md) first. This phase assumes its golden rules.

## Goal

Lay the rest of the home page on the dark reception table:

- **about**;
- **words** (testimonials, hidden while empty, with the flash-develop photos);
- the **order of service** card;
- the three **place cards** with prices;
- the **questions**.

**Out of scope:** the reply card (phase 11) and stories (phase 10).

## Preconditions

- [ ] Phase 07 is committed.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) D6, D7, D9, D14, D15, §5, §6 rows 04–08, §7 (flash develop, FAQ)
- The `about`, `words`, `process`, `collections` and `questions` namespaces of [`04-copy-deck.md`](04-copy-deck.md)
- `03-guardrails.md` §3: no invented testimonials and no invented prices

---

## Part A: Messages and data

1. Paste the five namespaces into both message files.
2. `apps/wedding/src/data/collections.ts`:

   ```ts
   export type CollectionKey = "elopement" | "intimate" | "full_day";

   export interface CollectionMeta {
     key: CollectionKey;
     /** "From" price in whole CAD; null until Lili confirms it (shows "On request"). */
     price: number | null;
   }

   export const COLLECTIONS: CollectionMeta[] = [
     { key: "elopement", price: null },
     { key: "intimate", price: null },
     { key: "full_day", price: null },
   ];
   ```

   Phase 09 adds `WEDDING_TYPES` to `@lili/core`. In that phase, retype
   `CollectionKey` as `WeddingType` from `@lili/core/api/schemas`.
3. `apps/wedding/src/data/words.dev.ts`, a **dev sample only** (D14):

   ```ts
   // DEV SAMPLE. Rendered only when NODE_ENV === "development" and the real list
   // in messages is empty, so the layout can be reviewed. Never real people.
   export interface Word { quote: string; names: string; place: string; date: string }
   export const DEV_WORDS: Word[] = [
     { quote: "Placeholder quote for layout review, two lines long so wrapping can be checked.", names: "DEV SAMPLE A & B", place: "Placeholder venue", date: "2025-09-13" },
     { quote: "A shorter placeholder quote.", names: "DEV SAMPLE C & D", place: "Placeholder city", date: "2025-06-21" },
   ];
   ```

## Part B: About (`sections/About.tsx`, server)

```text
<Tone tone="night" id="about" aria-labelledby="about-title" className="section-y">
  container-site grid gap-12 lg:grid-cols-12 lg:items-center
    Reveal lg:col-span-5
      Print photo=PLACEHOLDERS[ABOUT_PORTRAIT] ratio "4/5" rotate={-1.5}, no caption
    div lg:col-span-6 lg:col-start-7
      SectionHeader align="left" id="about-title" titleBase titleAccent
      Reveal delay 0.1 → body paragraphs: mt-8 space-y-5 text-body-fluid text-fg/75 max-w-[34em]
      Reveal delay 0.2 → mt-8 TextLink external href={portfolioHref(locale)}   {link}
</Tone>
```

A white print lying on the dark table is the point of this section. Keep it as it is, with no frame and no extra
decoration.

## Part C: Words (`sections/Words.tsx` + `components/WordsCarousel.tsx` + `components/FlashPhoto.tsx`)

**Server part** (`Words.tsx`):

```ts
const items = rawItems<Word>(t, "items");
const words = items.length > 0 ? items : process.env.NODE_ENV === "development" ? DEV_WORDS : [];
if (words.length === 0) return null; // D14: the section does not exist until real words do
```

**Layout:**

```text
<Tone tone="night" id="words" aria-labelledby="words-title" className="section-y">
  container-site
    SectionHeader (centred) id="words-title"
    div.mt-16 grid gap-12 lg:grid-cols-12 lg:items-center
      div lg:col-span-7 → WordsCarousel words labels locale
      div lg:col-span-5 grid grid-cols-2 gap-4
        FlashPhoto WORDS_PHOTOS[0] ratio "4/5"
        FlashPhoto WORDS_PHOTOS[1] ratio "4/5" delay 0.2   (offset: mt-12, so the pair is not a grid)
</Tone>
```

**`WordsCarousel`** (client):

- State: the index.
- Inside `AnimatePresence mode="wait"`, a `motion.figure` keyed by the index, using `crossfadeTransition` with opacity 0 → 1 and y 8 → 0. When motion is reduced, use opacity only.
- `blockquote`: `display text-[clamp(30px,3.6vw,54px)] leading-[1.1]`, text balanced.
- `figcaption.mt-6`:
  - `names` in roman `text-fg`;
  - then `place` and the year from `date` in italic `text-muted`, separated by a comma.
- When there are 2 or more items:
  - Previous and Next are `TextLink` buttons in a `mt-8 flex gap-8` row. They wrap around.
  - **No dots and no counter.**
- The quote container is `aria-live="polite"`.

**`FlashPhoto`** (client):

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import { FLASH_FROM, FLASH_TO, flashTransition } from "@/lib/motion";
import { Photo, type PhotoProps } from "./Photo";

/** A night photograph that develops like a flash firing: it enters overexposed
 *  and settles, once, when scrolled into view (02-design-decisions §7). */
export const FlashPhoto = ({ delay = 0, className = "", ...photo }: PhotoProps & { delay?: number }) => {
  const reduce = useReducedMotion();
  if (reduce) return <Photo className={className} {...photo} />;
  return (
    <motion.div
      className={className}
      initial={{ filter: FLASH_FROM }}
      whileInView={{ filter: FLASH_TO }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ ...flashTransition, delay }}
    >
      <Photo {...photo} />
    </motion.div>
  );
};
```

## Part D: Order of service (`sections/OrderOfService.tsx`, server)

```text
<Tone tone="night" id="process" aria-labelledby="process-title" className="section-y">
  container-site
    SectionHeader (centred) id="process-title"
    Reveal className="mt-14"
      Sheet keyline className="mx-auto max-w-[640px] px-8 py-14 text-center sm:px-14 md:py-20"
        p font-display uppercase tracking-[0.08em] text-[15px]   {cardHeading}   ← this section's one capitals line
        ol.mt-10 flex flex-col items-center gap-6 list-none
          for each step (index i):
            li.flex flex-col items-center gap-1
              {i > 0 && <Rule short className="mb-5" />}   ← short rule above every step but the first
              p.italic text-[16px] text-cyanotype     {when}     ← blue ink on paper (D6)
              p.display text-[clamp(24px,2.4vw,28px)] leading-[1.1]  {what}
              p.text-[15px] text-muted max-w-[28em]  {why}
</Tone>
```

It is an `ol` because the order matters, but no numbers are shown (`list-none`).
The rules sit inside the items, so screen readers count seven steps and not thirteen.

## Part E: Collections (`sections/Collections.tsx` + `components/PlaceCard.tsx`)

```text
<Tone tone="night" id="collections" aria-labelledby="collections-title" className="section-y">
  container-site
    SectionHeader (centred) id="collections-title"
    ul.mt-14 grid gap-6 md:grid-cols-3 max-w-[1100px] mx-auto list-none
      each COLLECTIONS item (index i) → li → Reveal delay={i*0.08} → PlaceCard
    Reveal → p.mx-auto mt-10 max-w-[46em] text-center italic text-muted   {addons}
</Tone>
```

**`PlaceCard`** (server): a `Sheet` (no keyline) with `flex h-full flex-col text-center`.

1. The fold strip: `border-b border-line bg-gradient-to-b from-[#f3f3f3] to-sheet px-4 py-3 italic text-[15px] text-muted`, holding `{duration}`. This is the place card's fold, and one of the two allowed gradients.
2. The body, `flex flex-1 flex-col items-center gap-3 px-6 pt-8 pb-10`:
   - `h3.display italic text-[36px] leading-none` `{name}`;
   - when `price !== null`:
     - `p.italic text-[16px] text-muted` `{from}`;
     - `p.display text-[46px] leading-none` `{formatPrice(price, locale)}`;
   - otherwise `p.display italic text-[30px] leading-none text-muted` `{onRequest}`;
   - `ul.mt-4 flex flex-col gap-1.5 text-[15px] text-muted list-none`, one `li` per inclusion. No ticks, no icons.

Prices are in ink (`text-fg`), not blue and not cognac. Restraint is the point.

## Part F: Questions (`sections/Questions.tsx` + `components/FaqItem.tsx`)

```text
<Tone tone="night" id="questions" aria-labelledby="questions-title" className="section-y">
  container-site grid gap-12 lg:grid-cols-12
    div lg:col-span-4 → div lg:sticky lg:top-28 → SectionHeader align="left" id="questions-title"
    div lg:col-span-8
      for each group:
        h3 font-display uppercase tracking-[0.08em] text-[14px] text-muted mt-14 first:mt-0 mb-3   {title}
        ul.list-none border-t border-line → FaqItem per item
</Tone>
```

The group names are the section's only capitals. The guardrail allows them because they act as
the dividers of a printed list.

**`FaqItem`** (client):

```tsx
const id = useId();
const [open, setOpen] = useState(false);
<li className="border-b border-line">
  <h4>
    <button type="button" aria-expanded={open} aria-controls={`${id}-a`} onClick={() => setOpen(o => !o)}
      className="flex w-full items-baseline justify-between gap-6 py-5 text-left">
      <span className="display text-[clamp(22px,2.2vw,30px)] leading-[1.2]">{q}</span>
      <motion.span aria-hidden animate={{ rotate: open ? 45 : 0 }} transition={disclosureTransition}
        className="font-display text-[30px] leading-none text-muted">+</motion.span>
    </button>
  </h4>
  <AnimatePresence initial={false}>
    {open && (
      <motion.div id={`${id}-a`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }} transition={disclosureTransition} className="overflow-hidden">
        <p className="max-w-[36em] pb-6 text-muted">{a}</p>
      </motion.div>
    )}
  </AnimatePresence>
</li>
```

When motion is reduced, pass `transition={{ duration: 0 }}`.

## Part G: Home page

Append these after `<HourByHour />`, in this order: `About`, `Words`, `OrderOfService`,
`Collections`, `Questions`. Keep the `{/* Phase 11: <ReplySection /> */}` comment before the end
of `main`.

## Part H: Verification

1. Run lint, typecheck, build, the greps and the parity check.
2. Production check: after `bun run build`, run `cd apps/wedding; bun run start` in the background
   (port 3052). Open `/`: the **Words section must not exist** in production (D14). Stop the server.
3. Visual QA at 1440 and 390, EN and FR (in dev, Words shows the DEV SAMPLE):
   - The openers vary as in `02` §6. No two consecutive sections open the same way.
   - About: a white print on the table, left-aligned header.
   - Flash develop runs once per photo (record `wedding-flash-develop.gif`).
   - The order-of-service card stays white with dark text on the table, and the "when" lines are cyanotype.
   - The place cards show "On request" / "Sur demande". There is no "from" while the price is null.
   - FAQ: keyboard toggles work, `aria-expanded` flips, and the height animates without jumps.
   - Q5: count the accents per viewport on the night half (white italic accent lines only).

## Definition of done

- [ ] About, Words (hidden in production while empty), Order of service, Collections and Questions render in EN and FR, with reduced-motion fallbacks.
- [ ] No invented testimonials or prices reach a production build.
- [ ] Lint, typecheck and build pass. The QA answers and the GIF are in the report.

## Commit message

```text
Lay the wedding home page's night half on the table

- Add the about section with a print lying on the reception table
- Add testimonials with flash-developed photographs, hidden until real ones exist
- Add the order of service card with cyanotype timings
- Add place cards for the three collections, showing "On request" until prices are set
- Add the grouped questions with animated disclosures
```
