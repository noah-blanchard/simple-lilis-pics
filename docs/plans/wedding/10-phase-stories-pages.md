# Phase 10: Stories pages

> Read [`README.md`](README.md) first. This phase assumes its golden rules.

## Goal

Show the wedding stories:

- the `/stories` index, filterable by wedding type;
- a `/stories/[slug]` page for each wedding, laid out automatically and with a lightbox;
- the home stories section and the hero's "See the stories" link, both of which appear only when at
  least one story exists.

**Out of scope:** chapters (D11) and editing stories (phase 09 did the admin).

## Preconditions

- [ ] Phases 08 and 09 are committed.
- [ ] Whether migration 0015 is applied and has stories (ask nothing; check by loading `/kit` with a
      temporary count, or by reading the dev log). If it does not, build everything, QA the empty
      states, and say so in the report. Visual QA of a real story then waits for the operator.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) D4, D8, D11, §5 (Print), §6 row 02, §7 (flash develop)
- The `stories` and `meta` namespaces of [`04-copy-deck.md`](04-copy-deck.md)
- `packages/core/src/data/weddings.ts` (phase 09)
- `packages/ui/src/components/ZoomableImage.tsx`, `apps/web/src/components/ProjectGallery.tsx` (keyboard, swipe, no-save)
- `apps/web/src/app/[locale]/portfolio/[id]/page.tsx` (`params` as a Promise, `generateMetadata`, `notFound`)
- The installed Next.js guide on dynamic route segments and `generateMetadata` under `apps/web/node_modules/next/dist/docs/`

---

## Part A: Messages and types

1. Paste the `stories` namespace into both message files. `meta.storiesTitle` and `meta.storiesDescription` are already there from phase 06.
2. Retype `CollectionKey` in `src/data/collections.ts` as `WeddingType` from `@lili/core/api/schemas` (the phase 08 note).

## Part B: The layout rhythm, `apps/wedding/src/lib/story-layout.ts`

A pure function, so it can be checked with `bun -e`:

```ts
import type { Orientation } from "@lili/core/types/db";

/** One row of a story page. Mixing these breaks the sequence into a rhythm
 *  that follows the photos' own orientation (no chapters, D11). */
export type StoryRow<P> =
  | { kind: "full"; photos: [P] }               // one landscape, full width
  | { kind: "pair"; photos: [P, P] }            // two portraits, or two landscapes side by side
  | { kind: "triptych"; photos: [P, P, P] }     // three portraits
  | { kind: "single"; photos: [P] };            // a lone portrait, centred, narrower

export function storyRhythm<P extends { orientation: Orientation }>(photos: P[]): StoryRow<P>[] {
  const rows: StoryRow<P>[] = [];
  let i = 0;
  while (i < photos.length) {
    const orientation = photos[i].orientation;
    let j = i;
    while (j < photos.length && photos[j].orientation === orientation) j++;
    const run = photos.slice(i, j);
    i = j;

    if (orientation === "landscape") {
      // Alternate full width and pairs so long landscape runs don't read as a feed.
      let k = 0;
      let full = true;
      while (k < run.length) {
        if (full || run.length - k === 1) { rows.push({ kind: "full", photos: [run[k]] }); k += 1; }
        else { rows.push({ kind: "pair", photos: [run[k], run[k + 1]] }); k += 2; }
        full = !full;
      }
    } else {
      // Portraits group by three; four split as two pairs; leftovers pair or stand alone.
      let rest = run;
      while (rest.length > 0) {
        if (rest.length === 4) { rows.push({ kind: "pair", photos: [rest[0], rest[1]] }, { kind: "pair", photos: [rest[2], rest[3]] }); rest = []; }
        else if (rest.length >= 3) { rows.push({ kind: "triptych", photos: [rest[0], rest[1], rest[2]] }); rest = rest.slice(3); }
        else if (rest.length === 2) { rows.push({ kind: "pair", photos: [rest[0], rest[1]] }); rest = []; }
        else { rows.push({ kind: "single", photos: [rest[0]] }); rest = []; }
      }
    }
  }
  return rows;
}
```

Check it:

```bash
cd apps/wedding && bun -e 'import("./src/lib/story-layout.ts").then(({storyRhythm})=>{const p=s=>s.split("").map((c,i)=>({i,orientation:c==="L"?"landscape":"portrait"}));for(const s of ["LLLLL","PPPPPPP","PLPPLLP","PPPP"]){const r=storyRhythm(p(s));console.log(s,r.map(x=>x.kind).join(" "),"|",r.flatMap(x=>x.photos.map(y=>y.i)).join(","))}})'
# expected, exactly:
# LLLLL full pair full full | 0,1,2,3,4
# PPPPPPP triptych pair pair | 0,1,2,3,4,5,6
# PLPPLLP single full pair full full single | 0,1,2,3,4,5,6
# PPPP pair pair | 0,1,2,3
```

Every photo appears **exactly once and in order**. Paste the output into the phase report.

## Part C: Shared story components (`apps/wedding/src/components/`)

| Component | Kind | Contract |
| --- | --- | --- |
| `StoryCaption.tsx` | server | `{ story: ResolvedWeddingStory; locale }` → the back of a photograph: `p.display italic text-[24px] leading-tight` `{couple}`, then `p.text-[15px] text-muted` with the venue, the season and year (`t("seasonYear", { season: t(\`seasons.${seasonOf(date)}\`), year })`, omitted when `date` is null), and `t("photographs", { count })`. Join with `, ` |
| `StoryPrint.tsx` | server | `Link` (`/stories/[slug]`) wrapping a `Print` (cover cropped to `4/5`, alt `${couple}, ${venue}`, slight rotation passed by the parent: −1, 0.8, −0.5 by index) plus `StoryCaption` below. Hover: the couple's name colour goes from fg to accent through a small client wrapper. Nothing lifts or scales |
| `StoryRows.tsx` | client | Renders `storyRhythm(photos)`. Each photo is a `button` (`aria-label={t("lightbox.open", { n })}`) wrapping a `Photo`. Rows: `full` uses `ratio "3/2"` across 12 columns; `pair` is `grid-cols-2 gap-4 md:gap-6` (portraits `4/5`, landscapes `3/2`); `triptych` is `grid-cols-3 gap-3 md:gap-6` at `2/3`; `single` is `mx-auto max-w-[560px]` at `4/5`. Rows are `mt-4 md:mt-6`. It calls `onOpen(index)`. Rows past `nightFrom` (prop) render photos through `FlashPhoto` instead of `Photo` |
| `StoryLightbox.tsx` | client | Described in Part E |

## Part D: Pages

### D1. `/stories`: `app/[locale]/stories/page.tsx` (server)

```text
<PageTop />
<main id="main">
  <Tone tone="day" className="section-y pt-12 md:pt-16">
    container-site
      SectionHeader as="h1" titleBase titleAccent (centred)
      p.mx-auto mt-6 max-w-[34em] text-center text-muted   {intro}
      {stories.length === 0
        ? p.mt-16 text-center italic text-muted {empty}
        : <StoriesIndex stories labels />}
  </Tone>
</main>
```

**`StoriesIndex`** (client):
- Filter row: `TextLink` buttons with `aria-pressed`, `mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2`, labelled All plus one per type **that has at least one story**. Hide the whole row when only one type exists.
- Grid: `mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3`, holding `StoryPrint`s.
- Filtering swaps the list. Use `AnimatePresence` with a short opacity crossfade (`crossfadeTransition`), with no layout animation.

`generateMetadata`: title `meta.storiesTitle`, description `meta.storiesDescription`.

### D2. `/stories/[slug]`: `app/[locale]/stories/[slug]/page.tsx` (server)

```ts
type Props = { params: Promise<{ locale: string; slug: string }> };
// const { locale, slug } = await params; setRequestLocale(locale);
// const found = await getWeddingStory(slug, locale as Locale); if (!found) notFound();
```

The page tells the story as a day. The first two thirds of the rows sit on paper, then a static
`DuskBand`, then the last third on the night table with flash-developed photos. This follows the home
page without any scroll-driven effect (one signature per page section, D8).

```text
<PageTop />
<main id="main">
  <Tone tone="day" className="pt-10 md:pt-14">
    container-site
      TextLink href="/stories"   {back}
      h1.display-xl mt-8 text-[clamp(44px,6.5vw,96px)] leading-[1.02]   {couple}
      p.mt-4 text-body-fluid text-muted   venue, season year, type label (stories.types.*)
      Reveal → Photo cover ratio "3/2" md:aspect-[16/9] priority mt-12
      {quote && figure.mx-auto my-24 max-w-3xl text-center
          blockquote.display italic text-[clamp(28px,3vw,44px)] leading-[1.15]  “{quote}” (use « » in fr)
          figcaption.mt-5 text-muted  {couple}}
      StoryRows photos={dayPhotos} offset={0}
  </Tone>
  <DuskBand />
  <Tone tone="night" className="pb-24">
    container-site → StoryRows photos={nightPhotos} offset={dayPhotos.length} nightFrom={0}
    {next && container-site mt-24 grid gap-10 md:grid-cols-12 md:items-center
        div md:col-span-4 → StoryPrint story={next}
        div md:col-span-6 md:col-start-6 → TextLink href={`/stories/${next.slug}`} className="display text-[clamp(28px,3vw,44px)]" {next label}}
  </Tone>
</main>
<StoryLightbox …/>   (state lives in a small client wrapper `StoryGallery` that renders both StoryRows and the lightbox; pass the day and night photo lists in and split there)
```

- Split the photos by **rows**, not by individual photos: compute `storyRhythm` on all photos, then cut at `Math.ceil(rows.length * 2 / 3)`. That way no row straddles the dusk.
- Exclude the cover photo from the rows when it is the first photo, so it does not show twice.
- `generateMetadata`:
  - title `couple`;
  - description from the venue and the season;
  - `openGraph.images` set to the cover URL.
- Unknown slug → `notFound()`. Add `app/[locale]/stories/[slug]/not-found.tsx` only if the app has no not-found page yet. A plain centred message (`stories.notFound`) with a `TextLink` back to `/stories` is enough.

## Part E: `StoryLightbox` (client)

Model it on how `ProjectGallery.tsx` uses `ZoomableImage`.

- Portal into `document.body`: `fixed inset-0 z-[var(--z-overlay)] flex flex-col` with `data-tone="night"` and `bg-ink`.
- Top bar, `flex items-center justify-between px-6 py-5`:
  - the counter `t("lightbox.counter", { current, total })` in `text-[13px] text-muted`. This is Outfit, not mono;
  - a close `TextLink` button.
- Centre: `ZoomableImage` with `src`, `alt`, `resetKey={index}`, `sizes="100vw"`, and `onSwipe={(dir) => go(dir)}`.
- Bottom bar: Previous and Next `TextLink` buttons, centred, `gap-10`. They are words, not arrows.
- Keyboard:
  - `ArrowLeft` / `ArrowRight` navigate;
  - `Escape` closes;
  - focus moves to the close button on open and back to the opening button on close;
  - Tab stays inside the dialog.
- Accessibility: `role="dialog" aria-modal="true" aria-label={couple}`. Lock body scroll while open.
- Animation: open and close fade over 0.3 s on `EASE`; when motion is reduced, it switches instantly. No zoom-from-thumbnail.
- `ZoomableImage` already carries `no-save`.

## Part F: Home stories and the hero link

1. `sections/HomeStories.tsx` (server):
   - `const stories = (await getWeddingStories(locale)).slice(0, 3)`; return `null` when empty.
   - `Tone tone="day" id="stories"`: a centred `SectionHeader`, then a `grid gap-x-8 gap-y-14 md:grid-cols-3 mt-14` of `StoryPrint`, then a centred `TextLink href="/stories"` `{all}` at `mt-14`.
2. Home page: insert `<HomeStories locale={locale} />` after `<Promises />`. Pass
   `hasStories={(await getWeddingStories(locale)).length > 0}` to `Invitation`. The call is cached, so
   calling it twice costs nothing.

## Part G: Verification

1. Run lint, typecheck, build, the greps and the parity check. Paste the `storyRhythm` output.
2. **Without stories** (migration not applied or no story marked):
   - `/stories` shows the empty line;
   - `/stories/anything` returns 404;
   - the home has no stories section and no hero link;
   - nothing crashes.
3. **With stories** (only if the operator has applied 0015 and marked a story), at 1440 and 390, EN and FR:
   - captions read like the back of a photograph;
   - the rhythm varies;
   - there is no layout shift;
   - the dusk band sits between whole rows;
   - night photos flash once;
   - the lightbox works with keys, swipe, Esc and focus return;
   - Q1–Q10.

   GIF: `wedding-story-lightbox.gif`.
4. If stories are not available, list "story QA pending operator data" in the report and continue.

## Definition of done

- [ ] `/stories` and `/stories/[slug]` are built, with metadata, empty and 404 states, rhythm layout, dusk split and lightbox.
- [ ] The home stories section and the hero link appear only when stories exist.
- [ ] Lint, typecheck and build pass. `storyRhythm` is verified.

## Commit message

```text
Show wedding stories on the wedding site

- Add the stories index with a filter by wedding type
- Add the story page: header, couple's quote, automatic photo rhythm, dusk to night, lightbox
- Add the home stories section and the hero link, shown only when stories exist
```
