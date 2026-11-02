# 02 · Design decisions (binding)

> This file overrides [`01-design-brief.md`](01-design-brief.md) wherever they
> differ. The brief is kept for its research and intent. Build from this file.
> The operator took these decisions on 2026-11-02 after reviewing the brief and the
> third style tile.

## 1. The idea in one paragraph

`wedding.lilispics.com` is the same photographer's site, wearing the clothes of one wedding day:

- **Same as lilispics.com:** the logo, the floating menu, the two-line headings, the pill buttons, the warm off-white canvas and the cognac accent are all identical, so a visitor knows at once that it is the same photographer.
- **Morning:** the top of the page is printed paper. The hero is an invitation card.
- **Dusk:** the "hour by hour" section turns the page from paper to night while a clock runs from 11:00 to 23:40.
- **Night:** everything after dusk sits on a dark reception table. Paper cards lie on it: the order of service, the place cards with prices, and the reply card that seals with wax.

## 2. Decisions

| # | Decision | Why |
| --- | --- | --- |
| D1 | Keep the brief's day → night concept | It gives the page a backbone that no competitor has (brief §2.4) |
| D2 | Reuse `/logo.webp`, the floating `MenuToggle` + circle-wipe `MenuOverlay`, the two-line `SectionHeader` with `AccentUnderline`, and the shared `PillButton` | These are what make lilispics.com recognisable. The brief's bans on pills and on the menu are lifted for these elements only |
| D3 | The menu list has **no numbers and no arrows** | The numbered "01–04" markers and ↗ read as template design; the menu works without them |
| D4 | Photographs are **square-cornered**. Paper objects (cards, envelope) take 2–5px radii, as in `ContactSuccess` and `ThankYouLetter`. No `rounded-card` (28px) on the wedding site | Square corners make the photographs read as prints, and keep the site apart from the portfolio's bento |
| D5 | Day tokens are the **lilispics.com tokens unchanged** | Kinship. The canvas is `#f4f4f4`, not the brief's `#f8f8f8` |
| D6 | Cognac `#9a5b1e` stays the UI accent (italic accent words, button wipe, focus ring, links on hover). **Cyanotype blue `#1b4a72` appears only on stationery details**: the "when" lines of the order of service, the postmark on the sealed envelope, the focus ring inside paper cards | The blue is the "something blue" of the day, used like ink |
| D7 | The night starts at dusk inside "hour by hour" and runs to the footer. Night `--accent` is paper white, so accent words on the table are italic white | A bright accent on near-black is a common AI tell, and cognac fails contrast on `#141414` |
| D8 | Signature effects: **scroll clock**, **flash develop**, **seal the reply**. Plus the existing `Reveal` and `AccentUnderline`. **No prints settling**, no parallax, no cursor effects, no marquee | One signature per section at most (§7) |
| D9 | The stationery metaphor only **where it does a job**: invitation (hero), order of service (process), place cards (prices), reply card (form), wax seal (submit). **No** decorative stamps, postmarks, tickets or tape. Plain, warm section titles. No cute renames ("Toasts", "Last dance", "Hello") | A theme on every element reads as generated |
| D10 | Hero: a centred invitation card on white paper with an inner keyline, and **one wide photograph** under it | It reads as stationery first, then as photography |
| D11 | Stories are **portfolio projects** with nullable wedding columns. **No chapters.** A story shows on both sites. The story page lays photos out with an automatic rhythm | Lili keeps one admin workflow |
| D12 | Inquiries go to a new `wedding_inquiries` table, with an admin inbox | Structured fields (date, guests, budget) need columns |
| D13 | Routes: `/`, `/stories`, `/stories/[slug]`, `/rsvp`, `/privacy`. **No `/experience`.** Home carries the full process, prices and FAQ | Smaller surface, and nothing is duplicated |
| D14 | Testimonials are static in messages and **ship empty**. The section is hidden when the list is empty. A dev-only sample file renders only when `NODE_ENV === "development"` | No fake reviews, ever |
| D15 | Prices come from a typed config. `null` shows "On request" / "Sur demande" | Prices are not supplied yet |
| D16 | The dusk gradient is **neutral grey** | True-neutral rule; the cyanotype tint read as "screen blue" |
| D17 | Hour by hour animates its colour tokens (`--bg`, `--fg`, `--muted`, `--line`) through motion values. This is the **only** exception to "animate transform, opacity, filter" | Text and background flip together from one source; it is one section, so the repaint cost is small |
| D18 | JetBrains Mono is removed from the wedding fonts | No mono anywhere on the wedding site |
| D19 | Anti-spam on the reply card: the honeypot (as on the contact form) plus a 3-second time trap | Mirrors the existing flow; there is no rate limiter in the repository |
| D20 | `noindex` stays until the operator's launch checklist | Copy and photos are drafts |

## 3. Tokens

Paste this block into `apps/wedding/src/app/globals.css` (phase 05), below the
existing imports and the `@source` line. It only **adds** tokens and **scopes**
existing ones; the day values come from `packages/ui/src/styles/theme.css`
unchanged.

```css
/* Wedding-only tokens. Day values are the shared theme's; these add the paper
   sheet and the cyanotype ink, then re-scope the palette for the night table.
   Never edit packages/ui/src/styles/theme.css for wedding needs. */
:root {
  --sheet: #ffffff;
  --cyanotype: #1b4a72;
  --cyanotype-strong: #12344f;
  --wax: #a8462b;
  --wax-deep: #722c19;
  --shadow-sheet: 0 24px 60px -30px rgb(0 0 0 / 0.45);
}

@theme inline {
  --color-sheet: var(--sheet);
  --color-cyanotype: var(--cyanotype);
  --color-cyanotype-strong: var(--cyanotype-strong);
  --color-wax: var(--wax);
}

/* The reception table. Utilities (bg-ink, text-fg, border-line…) resolve
   through these variables, so a section only needs data-tone="night". */
[data-tone="night"] {
  --bg: #141414;
  --panel: #1d1d1d;
  --panel-2: #262626;
  --line: #303030;
  --line-strong: #6b6b6b;
  --muted: #a0a0a0;
  --fg: #ededed;
  --fg-rgb: 237 237 237;
  --accent: #ffffff;
  --accent-strong: #ffffff;
  --on-accent: #141414;
  --inverse: #ededed;
  --on-inverse: #141414;
  --shadow-sheet: 0 30px 60px -36px rgb(0 0 0 / 0.9);
  color-scheme: dark;
  background-color: var(--bg);
  color: var(--fg);
}

/* A paper card lying on the table: back to day values, on white. */
[data-tone="day"] {
  --bg: #f4f4f4;
  --panel: #ededed;
  --panel-2: #e4e4e4;
  --line: #dbdbdb;
  --line-strong: #868686;
  --muted: #5c5c5c;
  --fg: #171717;
  --fg-rgb: 23 23 23;
  --accent: #9a5b1e;
  --accent-strong: #77440f;
  --on-accent: #ffffff;
  --inverse: #171717;
  --on-inverse: #f6f6f6;
  color-scheme: light;
  color: var(--fg);
}

/* Inside paper cards the focus ring is cyanotype ink. */
[data-paper] :focus-visible {
  outline-color: var(--cyanotype);
}
```

Contrast (WCAG, normal text):

| Pair | Ratio |
| --- | --- |
| `--muted #5c5c5c` on `#f4f4f4` | 6.1:1 |
| `--muted` on sheet `#ffffff` | 6.7:1 |
| `--fg #ededed` on `#141414` | 15.7:1 |
| `--muted #a0a0a0` on `#141414` | 7.0:1 |
| `--muted #a0a0a0` on `#1d1d1d` | 6.5:1 |
| cyanotype `#1b4a72` on `#ffffff` | 9.3:1 |
| cognac `#9a5b1e` on `#f4f4f4` | 4.9:1 |
| cognac on `#141414` | 3.4:1, which is why night `--accent` is paper white |
| `--line-strong #6b6b6b` on `#141414` | 3.5:1, enough for the ruled form lines (non-text, needs 3:1) |

## 4. Type

| Role | Family | Rules |
| --- | --- | --- |
| Display | Playfair Display 400, roman + italic (`font-display`, `.display`, `.display-xl`) | Headlines, invitation lines, vows, clock, quotes, prices, couple names, FAQ questions, form input text. Never bold. |
| Text | Outfit 300–600 (`font-sans`) | Paragraphs, captions, labels, buttons, menu meta, locale switcher |
| Capitals | Playfair Display uppercase, `tracking-[0.08em]` | **At most once per section**, and only on a stationery object: the invitation host line, the order-of-service card heading, the reply-card heading, FAQ group names |

- Section headings use the shared `SectionHeader` (moved to `@lili/ui` in phase 05):
  - a plain first line, then an italic accent line;
  - same sizes as lilispics.com;
  - `align="left"` exists and is used on purpose (§6).
- The hero `h1` uses the `renderAccentLine` grammar (`**word**` becomes an italic accent span) with **no** letter animation, as on lilispics.com.
- Times and numbers are figures:
  - EN: `2:30 pm`, `$3,200`;
  - FR: `14 h 30`, `3 200 $`.

  Use `apps/wedding/src/lib/format.ts`, never hand-built strings. The clock uses `tabular-nums lining-nums`.
- No underlines anywhere. Links show state through colour only.

## 5. Shapes, surfaces, shadows

| Object | Recipe |
| --- | --- |
| Photograph | `next/image`, square corners, `object-cover`, fixed aspect ratio box (`aspect-[3/2]`, `[2/3]`, `[4/5]`, `[16/9]`), `bg-panel` while loading, `no-save` + `draggable={false}` + context menu prevented |
| Print (photo on paper) | `bg-sheet p-[10px] pb-10`, caption in Outfit italic 14–15px muted inside the bottom margin, `shadow-[var(--shadow-sheet)]`, optional rotation of at most ±2° (static, not animated) |
| Sheet (paper card) | `bg-sheet rounded-[3px] shadow-[var(--shadow-sheet)]`, plus `data-tone="day" data-paper` so it keeps day colours on the table. Inner keyline: `absolute inset-[10px] rounded-[2px] border border-line pointer-events-none` (the `ThankYouLetter` pattern) |
| Place card | A sheet with a fold strip at the top: `border-b border-line`, a `bg-gradient-to-b from-[#f3f3f3] to-sheet` strip about 44px tall holding the duration in italic. This is the one allowed gradient besides dusk |
| Hairline rule | `h-px w-14 bg-line-strong`, centred. Used between vows and between order-of-service steps |
| Envelope | Same proportions and colours as `apps/web/src/components/ContactSuccess.tsx` (`aspect-[300/190]`, `rounded-[5px]`, `border-line-strong`, `bg-panel2`) |
| Buttons | `PillButton` only. On paper: `variant="light"` (ink pill, cognac wipe). On the table: `variant="light"` too (the night tokens make it a paper-white pill). At most **one** button per section |
| Text link | `TextLink` (phase 05): Outfit, `text-muted`, colour to `text-fg` on hover through motion, no underline, no arrow |

## 6. Home section map

| # | id | Section | Tone | Opener | Signature |
| --- | --- | --- | --- | --- | --- |
| — | `page-top` | Logo row (logo left; locale switcher + menu toggle right) | day | — | — |
| 00 | `invitation` | Invitation card + wide photograph | day | the card itself (`h1`) | `Reveal` |
| 01 | `promises` | Three promises + the coverage sentence | day | **no header**: the vows are the opener | `Reveal` |
| 02 | `stories` | Three latest wedding stories (phase 10; hidden if none) | day | `SectionHeader` centred, then one `TextLink` "All stories" | `Reveal` |
| 03 | `the-day` | Your day, hour by hour | day → night | `SectionHeader align="left"` inside the sticky clock column | **Scroll clock** |
| 04 | `about` | About Lili | night | `SectionHeader align="left"` in the text column | `Reveal` |
| 05 | `words` | Testimonials (hidden when empty) | night | `SectionHeader` centred | **Flash develop** |
| 06 | `process` | Order of service | night, card on it | `SectionHeader` centred; card heading in capitals | `Reveal` |
| 07 | `collections` | Three place cards | night, cards on it | `SectionHeader` centred | `Reveal` |
| 08 | `questions` | FAQ in four groups | night | `SectionHeader align="left"` in a sticky 4-column side, questions in 8 columns | none |
| 09 | `reply` | Reply card (phase 11) | night, card on it | intro column with `SectionHeader align="left"` | **Seal the reply** |
| — | `footer` | Closing line, button, contact, links | night | big two-line heading, as on lilispics.com | none |

Spacing:

- Every section uses `container-site` and `section-y` from `@lili/ui`.
- Do not add extra top padding on top of `section-y`.
- The grids follow lilispics.com: 12 columns with `gap-6`/`gap-10`, splits 5/7, 7/5 and 4/8.

## 7. Motion

All values build on `EASE` from `@lili/ui/lib/motion`. Wedding timings live in
`apps/wedding/src/lib/motion.ts` (phase 05).

| Effect | Where | Spec | Reduced motion |
| --- | --- | --- | --- |
| Reveal | most blocks | the shared `Reveal` (24px rise, 0.8 s, once, `-80px` margin) | the shared component already fades only |
| Accent letters | `SectionHeader` accent line | the shared `AccentUnderline` | static accent colour |
| **Scroll clock** | `the-day` | `useScroll({ target, offset: ["start start", "end end"] })`. Progress maps piecewise to minutes through the moment times (§8) and is rounded to 5. The label updates through `useMotionValueEvent`. Tokens interpolate from day to night between the 5th and 6th moments | no clock animation: each moment shows its own time; day moments on paper, then a static neutral dusk band, then night moments |
| **Flash develop** | the two photos in `words`, and story photos marked as night (phase 10 decides: the last third of a story) | `initial={{ filter: "brightness(2.6) contrast(0.7)" }}`, `whileInView={{ filter: "brightness(1) contrast(1)" }}`, 0.6 s, `EASE`, once; the second photo is delayed 0.2 s | no filter |
| **Seal the reply** | `reply` and `/rsvp` | The card slides down into the envelope (0.5 s). The flap rotates closed (`rotateX` 180 → 0, 0.45 s). The seal presses with the `ContactSuccess` springs (scale: stiffness 520, damping 17; rotate: stiffness 300, damping 13). A cyanotype postmark stamps last (scale 1.15 → 1, opacity 0 → 0.85, 0.3 s) | a static sealed envelope with the postmark |
| Hover | links, buttons | `hoverColorTransition`; `PillButton` keeps its own wipe | as shared |
| FAQ | disclosure | `AnimatePresence` height `0 ↔ "auto"` 0.4 s; the `+` rotates 45° to read as `×` | instant |

## 8. Hour by hour: the eight moments

| Key | Time | Day part | Tone |
| --- | --- | --- | --- |
| `getting-ready` | 11:00 | morning | day |
| `first-look` | 14:00 | afternoon | day |
| `ceremony` | 15:30 | afternoon | day |
| `family` | 16:15 | afternoon | day |
| `portraits` | 17:00 | afternoon | day |
| `golden-hour` | 19:30 | evening | dusk (token interpolation runs across this moment) |
| `speeches` | 20:30 | evening | night |
| `last-dance` | 23:40 | night | night |

The clock shows the time in figures, with the part of the day in italic beside it:

- EN: `2:30 pm` and *in the afternoon*;
- FR: `14 h 30` and *l'après-midi*.

The clock is `aria-hidden`; every moment also prints its own time as text.

## 9. Components

App-local components live in `apps/wedding/src/components/`, sections in
`apps/wedding/src/sections/`, data in `apps/wedding/src/data/`.

| Component | Location | Phase | Notes |
| --- | --- | --- | --- |
| `WaxSeal` | `@lili/ui/components/WaxSeal` | 05 | moved from `apps/web`, new optional `logoSrc` prop |
| `Reveal`, `AccentUnderline`, `SectionHeader` | `@lili/ui/components/*` | 05 | moved from `apps/web`, behaviour unchanged |
| `PillButton`, `ZoomableImage` | `@lili/ui/components/*` | — | already shared |
| `Tone`, `Sheet`, `Print`, `Photo`, `TextLink`, `Rule` | app-local | 05 | primitives |
| `Logo`, `LocaleSwitcher`, `MenuIcon`, `MenuToggle`, `HoverLink`, `FloatingMenuButton`, `MenuOverlay`, `NavList` | app-local | 06 | adapted copies of the `apps/web` originals (they import the app's `@/i18n/navigation`, so they cannot be shared) |
| `MenuProvider`, `PageTop` | app-local | 06 | one menu state for the logo-row toggle and the floating pill |
| `Footer` | app-local section | 06 | in the `[locale]` layout |
| `Invitation`, `Promises`, `HourByHour`, `HourByHourClient`, `Moment`, `Clock`, `DuskBand` | app-local | 07 | |
| `About`, `Words`, `WordsCarousel`, `FlashPhoto`, `OrderOfService`, `Collections`, `PlaceCard`, `Questions`, `FaqItem` | app-local | 08 | |
| `StoryCaption`, `StoryPrint`, `StoriesIndex`, `StoryRows`, `StoryGallery`, `StoryLightbox`, `HomeStories` | app-local | 10 | layout rhythm in `src/lib/story-layout.ts` |
| `ReplyCard`, `SealedEnvelope`, `Postmark`, `ReplySection` | app-local | 11 | |

## 10. What we do not do (replaces brief §11)

The full list, with the grep checks, is in [`03-guardrails.md`](03-guardrails.md). The changes from the brief:

- Pills are allowed **only** as `PillButton`, `MenuToggle` and `LocaleSwitcher`. Still no badges, chips, dot pills or tag pills.
- Numbered markers stay banned, including in the menu.
- Mono stays banned. The wedding `LocaleSwitcher` uses Outfit.
- Decorative stamps and postmarks are banned. The only postmark is the one stamped on the sealed envelope.
- The 2px square button from the brief is dropped in favour of `PillButton`.
