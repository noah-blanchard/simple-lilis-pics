# Phase 07: Home, the day half

> Read [`README.md`](README.md) first. This phase assumes its golden rules.

## Goal

Build the top of the home page:

- the **invitation** hero (a card, then one wide photograph);
- the **promises**;
- the signature **hour by hour** section, where a large clock runs from 11:00 to 23:40 while the page turns from paper to night.

**Out of scope:** the stories section (phase 10) and everything after hour by hour (phase 08).

## Preconditions

- [ ] Phase 06 is committed.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) §4, §5, §6 rows 00, 01, 03, §7 (scroll clock), §8
- The `hero`, `promises` and `day` namespaces of [`04-copy-deck.md`](04-copy-deck.md)
- `apps/web/node_modules/motion/` is not documented locally. Use the motion 12 API you know:
  - `useScroll({ target, offset })`;
  - `useTransform(value, inputRange, outputRange)`, which interpolates colours;
  - `useMotionValueEvent`;
  - `useReducedMotion`.

  Check the installed types (`apps/wedding/node_modules/motion/dist/*.d.ts`) whenever unsure.
- `apps/web/src/components/rate/ThankYouLetter.tsx` (the letter card and its inner keyline)

---

## Part A: Messages

Paste the `promises` and `day` namespaces into both message files. `hero` is
already there from phase 06.

## Part B: Invitation (`sections/Invitation.tsx`, server)

```text
<Tone tone="day" id="invitation" className="pt-10 pb-24 md:pt-14 md:pb-32">
  container-site
    Reveal
      Sheet keyline  (mx-auto max-w-[720px] px-8 py-14 sm:px-14 md:py-20, text-center, flex flex-col items-center gap-5)
        p   caps:   font-display uppercase tracking-[0.08em] text-[15px] md:text-[17px]   {host}
        p   italic: font-display italic text-[20px] md:text-[22px] text-muted          {lead}
        h1  display-xl text-[clamp(44px,7vw,104px)] leading-[1.02]                      {renderAccentLine(title)}
        p   italic: same as lead                                                       {lead2}
        p   text-body-fluid max-w-[26em] text-fg/75                                    {place} {reassurance}
        Rule
        p   italic text-[16px] text-muted                                              {availability}
            (not in capitals: the host line already used this section's one capitals line)
        div flex flex-wrap items-center justify-center gap-x-9 gap-y-3 mt-2
          PillButton variant="light" href="#footer"   {cta}      ← phase 11 changes the href to "#reply"
          {hasStories && <TextLink href="/stories">{storiesLink}</TextLink>}   ← prop, false until phase 10
    Reveal delay={0.1} className="mt-12 md:mt-16"
      Photo src={PLACEHOLDERS[HERO_PHOTO].src} alt={…[locale]} ratio="4/5" className="md:aspect-[16/9]"
            sizes="(min-width: 1440px) 90vw, 100vw" priority
</Tone>
```

- Capitals appear once in this section, on the host line (D9, §4).
- The `h1` uses `renderAccentLine`, so `**simply**` becomes an italic cognac word. There is no letter animation, as on lilispics.com's hero.
- Props: `{ locale: Locale; hasStories: boolean }`.

## Part C: Promises (`sections/Promises.tsx`, server)

There is no visible section header (D9: the vows are the opener).

```text
<Tone tone="day" id="promises" aria-labelledby="promises-title" className="section-y">
  h2#promises-title.sr-only {heading}
  container-site → ul.mx-auto.max-w-3xl.flex.flex-col.items-center.gap-10.text-center
    for each item (index i):
      li → Reveal delay={i * 0.08}
        {i > 0 && <Rule className="mb-10" />}   ← the hairline sits inside the item, so the list keeps three items
        p.display text-[clamp(30px,3.6vw,48px)] leading-[1.08]   {title}
        p.mt-3 text-body-fluid text-muted max-w-[30em] mx-auto   {line}
  Reveal → p.mx-auto mt-16 max-w-[34em] text-center italic text-muted   {coverage}
</Tone>
```

Read the items with `rawItems<{ title: string; line: string }>(t, "items")`.

## Part D: Moments data (`data/moments.ts`)

```ts
import type { PlaceholderKey } from "./placeholder-photos";

export type MomentKey = "getting-ready" | "first-look" | "ceremony" | "family" | "portraits" | "golden-hour" | "speeches" | "last-dance";

export interface MomentMeta {
  key: MomentKey;
  /** Minutes since midnight (02-design-decisions §8). */
  minutes: number;
  tone: "day" | "dusk" | "night";
  photo: PlaceholderKey;
}

export const MOMENTS: MomentMeta[] = [
  { key: "getting-ready", minutes: 11 * 60, tone: "day", photo: "…" },
  { key: "first-look", minutes: 14 * 60, tone: "day", photo: "…" },
  { key: "ceremony", minutes: 15 * 60 + 30, tone: "day", photo: "…" },
  { key: "family", minutes: 16 * 60 + 15, tone: "day", photo: "…" },
  { key: "portraits", minutes: 17 * 60, tone: "day", photo: "…" },
  { key: "golden-hour", minutes: 19 * 60 + 30, tone: "dusk", photo: "…" },
  { key: "speeches", minutes: 20 * 60 + 30, tone: "night", photo: "…" },
  { key: "last-dance", minutes: 23 * 60 + 40, tone: "night", photo: "…" },
];
```

Assign photos after looking at them (phase 05 F2). Put the darkest ones on the night moments.

## Part E: Hour by hour

### E1. Files

| File | Kind | Role |
| --- | --- | --- |
| `sections/HourByHour.tsx` | server | Reads messages and data, then renders `HourByHourClient` with resolved props (labels, moment texts, photos with locale alt) |
| `components/HourByHourClient.tsx` | client | Scroll mapping, token interpolation, sticky clock, moment list |
| `components/Moment.tsx` | server-safe (no hooks) | One moment: photo, time text, title, line |
| `components/Clock.tsx` | client | Big figures and the italic day part; `aria-hidden` |
| `components/DuskBand.tsx` | server | Static neutral gradient, used only on the reduced-motion path |

### E2. The scroll mapping and tokens (skeleton)

```tsx
"use client";

import { motion, type MotionStyle, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { dayPartOf, formatTime } from "@/lib/format";

// Day and night values of the four tokens this section animates (D17). They
// mirror globals.css; the section is the only place colours are interpolated.
const DAY = { bg: "#f4f4f4", fg: "#171717", muted: "#5c5c5c", line: "#dbdbdb" };
const NIGHT = { bg: "#141414", fg: "#ededed", muted: "#a0a0a0", line: "#303030" };

export function HourByHourClient({ moments, locale, partLabels, header, intro }: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // One stop per moment, evenly spaced: progress i/(n-1) shows moment i's time.
  const last = moments.length - 1;
  const stops = moments.map((_, i) => i / last);
  const minutes = useTransform(scrollYProgress, stops, moments.map((m) => m.minutes));

  const initial = moments[0].minutes;
  const [clock, setClock] = useState(() => ({ time: formatTime(initial, locale), part: dayPartOf(initial) }));
  useMotionValueEvent(minutes, "change", (v) => {
    const rounded = Math.round(v / 5) * 5;
    setClock({ time: formatTime(rounded, locale), part: dayPartOf(rounded) });
  });
  // setState with an equal string is cheap, but compare first to skip renders:
  // if (next.time !== clock.time) …  (use a functional update)

  // Dusk runs across the golden-hour moment: half a step before it to half a step after.
  const duskIndex = moments.findIndex((m) => m.tone === "dusk");
  const dusk = [(duskIndex - 0.5) / last, (duskIndex + 0.5) / last];
  const bg = useTransform(scrollYProgress, dusk, [DAY.bg, NIGHT.bg]);
  const fg = useTransform(scrollYProgress, dusk, [DAY.fg, NIGHT.fg]);
  const muted = useTransform(scrollYProgress, dusk, [DAY.muted, NIGHT.muted]);
  const line = useTransform(scrollYProgress, dusk, [DAY.line, NIGHT.line]);

  if (reduce) return <StaticDay … />; // Part E4

  const style = { "--bg": bg, "--fg": fg, "--muted": muted, "--line": line, backgroundColor: bg, color: fg } as MotionStyle;

  return (
    <motion.section ref={ref} id="the-day" aria-labelledby="the-day-title" style={style} className="relative">
      <div className="container-site grid gap-x-10 lg:grid-cols-12">
        {/* Desktop: sticky column with the header and the clock. */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-0 flex h-svh flex-col justify-center gap-10">
            {header /* SectionHeader align="left" id="the-day-title" */}
            <p className="max-w-[26em] text-muted">{intro}</p>
            <Clock time={clock.time} part={partLabels[clock.part]} />
          </div>
        </div>
        {/* Phones: header above, clock pinned as a slim bar. */}
        <div className="lg:hidden">… header, intro …</div>
        <div className="sticky top-0 z-[var(--z-base)] -mx-6 border-b border-line bg-[var(--bg)] px-6 py-3 pr-32 lg:hidden">
          <Clock compact time={clock.time} part={partLabels[clock.part]} />
        </div>
        <ol className="lg:col-span-6 lg:col-start-7">
          {moments.map((m) => (
            <li key={m.key} className="flex min-h-[85svh] items-center py-16 lg:py-0"><Moment {...m} /></li>
          ))}
        </ol>
      </div>
    </motion.section>
  );
}
```

Notes for implementation:

- The `pr-32` on the phone clock bar keeps the time clear of the floating menu pill (Q8).
- Accent words inside the section (the `SectionHeader` accent line) read `var(--accent)`. They sit at the top, in daylight, so they stay cognac.
- Read the installed motion types to confirm that CSS variables accept motion values in `style`. If the types reject it, keep the `as MotionStyle` cast and add a one-line comment.
- The section's last moment ends in night colours. The next section (phase 08) is `data-tone="night"`, so there is no seam. Until phase 08 exists, the footer follows, which is also night.

### E3. `Clock` and `Moment`

**`Clock`**:
- `aria-hidden`.
- The time: `p.display tabular-nums lining-nums leading-none text-[clamp(64px,8vw,128px)]`.
- The day part beside it (or below it when `compact`): `p.font-display italic text-[20px] text-muted`.
- In `compact` mode (phones), the time is `text-[40px]` and the part sits beside it on one baseline.

**`Moment`**:

```text
article.w-full
  Photo ratio by orientation ("3/2" landscape, "4/5" portrait), sizes="(min-width:1024px) 45vw, 100vw"
  p.mt-5 text-[15px] italic text-muted → <time>{timeText}</time>   (formatTime(minutes, locale), always printed: the clock is aria-hidden)
  h3.display mt-1 text-[clamp(30px,2.8vw,42px)] leading-[1.06]   {title}
  p.mt-2 max-w-[30em] text-muted                                  {line}
```

### E4. Reduced motion (`StaticDay`)

- Render the same header and intro with no sticky clock.
- Then the day and dusk moments in a normal list on day colours.
- Then `<DuskBand />`.
- Then a `<Tone tone="night" as="div">` holding the night moments.
- No motion values are read.

**`DuskBand`**:

```tsx
/** Static dusk between paper and table, for visitors who prefer reduced motion. Neutral grey (D16). */
export const DuskBand = () => (
  <div aria-hidden className="h-[clamp(150px,20vw,260px)] bg-[linear-gradient(180deg,#f4f4f4_0%,#d6d6d6_26%,#6a6a6a_62%,#141414_100%)]" />
);
```

## Part F: Home page

`apps/wedding/src/app/[locale]/page.tsx` becomes:

```tsx
<>
  <PageTop />
  <main id="main">
    <Invitation locale={locale} hasStories={false} />
    <Promises />
    {/* Phase 10: <HomeStories /> */}
    <HourByHour locale={locale} />
    {/* Phase 08: night sections */}
  </main>
</>
```

Every section that calls `getTranslations` gets the locale through `setRequestLocale` in the page
(it is already in the layout; keep the page's `setRequestLocale(locale)` too, per the next-intl docs).

## Part G: Verification

1. Run lint, typecheck, build, the greps and the parity check.
2. Visual QA at 1440 and 390, EN and FR:
   - The invitation reads as a printed card: one capitals line, a cognac italic accent word, a pill button.
   - The photo below has no layout shift.
   - The promises open with no header, which is different from the hero.
   - Hour by hour:
     - The clock reads `11:00 am` / `11 h 00` at the top and `11:40 pm` / `23 h 40` at the end.
     - The clock never jitters in width.
     - The page turns to night across golden hour.
     - Text stays readable throughout the transition (check mid-dusk, where contrast is lowest; the moment text must stay at least 4.5:1, so if not, narrow the dusk range).
     - On phones the clock bar is not covered by the menu pill.
   - Reduced motion: the static path renders with the dusk band.
3. GIF: `wedding-scroll-clock.gif` (scroll through the whole section).
4. Compare the hero with lilispics.com's hero at 1440. The answer to Q1 must be "yes".

## Definition of done

- [ ] Invitation, promises and hour by hour render in EN and FR, with the reduced-motion path.
- [ ] The clock is driven by scroll, rounded to 5 minutes, `aria-hidden`, and every moment prints its own time.
- [ ] Colour tokens interpolate only inside `#the-day` (D17).
- [ ] Lint, typecheck and build pass. The QA answers and the GIF are in the report.

## Commit message

```text
Build the day half of the wedding home page

- Add the invitation hero: a printed card with one wide photograph below
- Add the three promises with the coverage line
- Add hour by hour: a scroll-driven clock from 11:00 to 23:40 that turns the page to night at golden hour
- Add the reduced-motion path with a static neutral dusk band
```
