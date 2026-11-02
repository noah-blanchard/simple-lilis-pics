# Phase 01: design brief — "The invitation, day to night"

> Read [`README.md`](README.md) first. This brief is the visual and content
> source for phases 02–07.

## 1. Intent

`wedding.lilispics.com` should feel like it comes from the same photographer as
`lilispics.com`, but it should tell a different story. The portfolio is a calm, neutral **gallery**.
The wedding site is a **wedding stationery suite that lives through one day**:

- the top of the page is morning paper: crisp white, hairline frames, ink;
- the middle turns through dusk;
- the bottom is the dance floor at night: near-black, with flash-lit photographs, toasts, and the RSVP.

It says "wedding" through objects and rituals: the invitation, stamps, the
order of service, toasts, the RSVP card, the wax seal, and "something blue".
It does **not** use the usual signals: blush, gold foil, script fonts, florals,
or beige.

## 2. Research findings

About 30 wedding-photographer sites were inspected through their HTML and CSS
(fonts, colours, headings), along with six curated roundups (see §12).

### 2.1 What the category looks like

- **Palette:** ivory, blush, beige, or greige, with gold or brown accents. Sage is the "modern" variant.
- **Type:**
  - Cormorant, Cinzel, Trajan, Playfair, or EB Garamond, often all caps and tracked out.
  - A script font for names.
  - Raleway or Montserrat for body text.

  Examples: Jeremy Chou (Cinzel + Cormorant), Corbin Gurkin (Trajan + Playfair), and John & Joseph (Cormorant).
- **Builders:** most sites run on Showit, Squarespace, or StyleCloud templates. Layouts repeat: a full-bleed slideshow, a centred serif tagline, a three-column "portfolio / about / inquire" block, and an Instagram strip.

### 2.2 Sites that stand out, and the idea worth taking

| Site | What makes it different | Idea we keep |
| --- | --- | --- |
| [Ethan Wong](https://ethanwong.photography) | Parchment and ink, numbered 01–04 index, live quote calculator, transparent pricing | Numbered index; honest "from" prices |
| [Marcos Sanchez](https://marcossanchez.net) | Saol high-contrast serif + Dia grotesk, cream with an oxblood accent, press logos | A single deep accent on a quiet canvas |
| [Louise Griffin](https://louisegriffinphotography.com) | IBM Plex Mono + EB Garamond, Roman-numeral index, 35mm film nostalgia | Mono + serif pairing (already Lili's DNA) |
| [Toast of Leeds](https://www.toastofleeds.co.uk) | Black and mustard, loud headlines ("Real love is messy"), "Choose your adventure" cards that lead to pricing | Wedding-type cards; confident voice |
| [Simon Dewey](https://www.simondewey.co.uk) | Bauhaus black-and-white grid; "Love having your photo taken? Me neither."; 35mm film add-on; grouped FAQ | Reassurance for camera-shy couples; film add-on |
| [Liam + Bee](https://liamandbee.com) | Unbounded + Newsreader; coverage shown as a stat (85% documentary / 10% portraits / 5% groups) | Coverage split as a number |
| [Jeremy Chou](https://www.jeremychou.com) | Manifesto, process, stats ("15 weddings a year max"), upcoming destinations | Scarcity stat; process as a section |
| [Rachel Burt](https://rachelburtphotography.com), [Cassandra Lane](https://www.cassandralane.co.uk) | Bold colour (pink, red, teal) | Proof that colour can work, if it has a reason |

### 2.3 Sections couples expect

These sections recur across the strong sites and the conversion-focused guides:

- a hero with an availability chip ("Now booking 2027");
- an approach or manifesto;
- **full wedding stories**, not only loose photos;
- an about section;
- the experience, from inquiry to gallery;
- **starting prices** (one vendor survey says many couples won't inquire without them);
- testimonials;
- press or awards;
- a grouped FAQ;
- an inquiry form that qualifies the lead (date, venue, guest count, budget);
- a scarcity stat;
- wedding-type entry points (elopement, intimate, full day).

### 2.4 The gap we take

Nobody does crisp stationery without the gold and blush. Almost nobody uses
blue. Nobody tells the **day hour by hour** as the backbone of the page.

## 3. Kinship with lilispics.com

| Kept (brand DNA) | Changed (wedding feeling) |
| --- | --- |
| JetBrains Mono labels (`.tag-mono`) | Display font: Instrument Serif instead of Playfair Display |
| Italic serif accent words in the accent colour (`renderAccentLine` grammar) | Body font: Instrument Sans instead of Outfit |
| Wax seal object, oxblood `#a8462b` | Accent: "something blue" ink instead of cognac |
| `EASE` and timings from `@lili/ui/lib/motion` | Canvas: paper white by day and near-black by night, instead of gallery gray |
| `container-site`, `section-y`, `.grain` | Shape: sharp 2px corners and hairline frames, instead of 28px cards and pills |
| Lili's warm first-person voice | Objects: prints, stamps, cards, and envelopes, instead of the bento grid |

## 4. Information architecture

### 4.1 Home: the order of the day

Home is one long scroll. Every section starts with a mono **timestamp eyebrow**,
and the times advance through the page like a wedding programme.

| # | Eyebrow | Section | Tone | Content |
| --- | --- | --- | --- | --- |
| 00 | `09:00 — THE INVITATION` | Hero | day | Headline using the italic-accent grammar (EN *"You're invited to **simply** be there."*). Lili · Montréal & beyond. Chip: "Now booking 2027 · 2028". CTAs: **Check your date** (to RSVP) and *See the stories*. Visual: three loose framed prints and a stamp thumbnail, laid out like an invitation suite on a table. |
| 01 | `10:15 — THE PROMISE` | Vows (approach) | day | Three short first-person "vows": *you never have to perform*; *I'll notice what you'd miss*; *every frame is graded by hand*. Coverage split stat: documentary / portraits / groups. |
| 02 | `11:30 — STORIES` | Featured weddings | day | Three story cards (couple first names, place, season, frame count) linking to `/stories/[slug]`. Type chips: elopement, intimate, full day. |
| 03 | `14:00 → 23:40` | The day, hour by hour | day → dusk → night | **Signature section.** A sticky mono clock runs from 09:00 to 23:40 while eight moments scroll past: getting ready, first look, ceremony, family, portraits, golden hour, speeches, last dance. One photograph and one line each. The dusk band lives here. It doubles as "what I cover". |
| 04 | `16:45 — HELLO` | About | night | Portrait, short bio, and a link to `lilispics.com` ("the rest of my work"). |
| 05 | `19:30 — TOASTS` | Testimonials | night | Large serif quotes, couple names and place, line-by-line reveal, previous/next controls. |
| 06 | `20:10 — THE PROGRAM` | Experience | night | An order-of-service card: inquiry → 30-minute call → reserve (contract + retainer) → planning (timeline, family list, scouting) → the day → sneak peek within 72 h → full gallery in about 6 weeks (+ album). |
| 07 | `21:00 — COLLECTIONS` | Investment | night | "From" prices styled like place cards. Collections: **Elopement**, **Intimate** (up to 6 h), **Full day** (about 10 h). Add-ons: second photographer, 35mm film rolls, engagement session, heirloom album, extra hour. Real prices to be supplied by Lili. |
| 08 | `22:30 — GOOD TO KNOW` | FAQ | night | Groups and seed questions are in §4.3. |
| 09 | `23:40 — RSVP` | Inquiry | night | Form described in §4.4. On success the card slides into an envelope and the wax seal is pressed on. |
| — | `LAST DANCE` | Footer | night | Availability, email, Instagram, EN/FR, link back to `lilispics.com`, legal links. |

### 4.2 Other routes (later phases)

| Route | Purpose |
| --- | --- |
| `/stories` | Index of full weddings, filterable by type |
| `/stories/[slug]` | One wedding told in time chapters, with mixed layouts (full-bleed, pair, triptych, pull quote from the couple) and a lightbox |
| `/experience` | Full collections, process, and FAQ (home shows summaries) |
| `/rsvp` | The inquiry form on its own page |

French uses the shared `/fr` prefix from `@lili/core/i18n/routing`.

### 4.3 FAQ seed

Answers are to be written with Lili.

- **Style & approach:**
  - Do we need to know how to pose?
  - Do you do family group photos?
  - Do you work with a second photographer?
  - Do you shoot film?
- **Booking & travel:**
  - How do we reserve our date?
  - Is there a retainer or a payment plan?
  - Do you travel outside Montréal?
  - How many weddings do you take each year?
- **On the day:**
  - What if it rains?
  - Can you work in dark venues?
  - Do you need a meal and a break?
- **After the wedding:**
  - When do we see the photos?
  - Do you make albums?
  - Can we ask you not to share our images?

### 4.4 RSVP fields

- Your names
- Email
- Wedding date, with a "not set yet" option
- Venue or city
- Guest count (range)
- Collection of interest
- Budget range
- How did you hear about me?
- Message
- Privacy consent, with a link to the privacy policy (Québec Law 25)

The form should take about one minute to complete.

## 5. Colour

The colours are **tokens with the same names as `packages/ui/src/styles/theme.css`**,
so the shared utilities (`bg-ink`, `text-fg`, `text-accent`, `border-line`, …)
keep working. The wedding app overrides them in its own `globals.css`. Night is a
**token scope** on a section (`data-tone="night"`) that redefines the same
variables. Components therefore never need `dark:` variants.

| Token | Day: paper | Night: dance floor | Role |
| --- | --- | --- | --- |
| `--bg` | `#fafafa` | `#0f0f0f` | Canvas |
| `--panel` | `#f2f2f2` | `#181818` | Surface 1 |
| `--panel-2` | `#e9e9e9` | `#222222` | Surface 2 |
| `--line` | `#e0e0e0` | `#2c2c2c` | Hairlines and frames |
| `--line-strong` | `#8a8a8a` | `#6b6b6b` | Input borders |
| `--muted` | `#5e5e5e` | `#a3a3a3` | Secondary text |
| `--fg` | `#141414` | `#f2f2f2` | Primary text |
| `--accent` | `#2b3a9e` | `#8c9cff` | "Something blue": italic accent words, primary button, ink strokes |
| `--accent-strong` | `#1e2a7a` | `#b3bdff` | Hover and pressed states |
| `--accent-soft` | `#e8ebf8` | `#1a1f3d` | Small chips only |
| `--accent-line` | `#c9d0f0` | `#2e3670` | Hairline paired with soft chips |
| `--on-accent` | `#ffffff` | `#0f0f0f` | Text on an accent fill |
| Wax seal | `#a8462b` / `#722c19` | same | Shared object colour, never used for UI |

Rules:

- **Grays are true neutral (R=G=B).** The only colour is the accent, and it never fills large areas.
- **Contrast targets:** `--accent` on paper is about 9:1 and on night about 7.5:1. `--muted` on its canvas must stay at or above 4.5:1.
- **Dusk band:** a tall gradient from `--bg` day to `--bg` night, inside the hour-by-hour section.
  - The default is **neutral**.
  - A "blue hour" variant mixes in the accent at low alpha. It is the only proposed tint exception, and it is shown on the style tile so that it can be judged by eye before anyone adopts it.

## 6. Typography

All three families are in the installed `next/font/google` list.

| Role | Family | Use |
| --- | --- | --- |
| Display | **Instrument Serif** 400, normal and italic | Headlines set very large (clamp up to about 9rem on desktop); italic accent words in `--accent`; quotes and prices |
| Body | **Instrument Sans**, variable (`wght`, `wdth`) | Paragraphs, form text, buttons where a sans fits better |
| Labels | **JetBrains Mono** 400/500 | Timestamps, eyebrows, captions, postmarks, button labels (uppercase, 0.08em tracking) |

- Replace `apps/wedding/src/lib/fonts.ts`, keeping the same CSS variable names (`--font-display`, `--font-sans-body`, `--font-jetbrains-mono`). That way `base.css` needs no change.
- **No script font.** Handwriting appears only as **SVG ink strokes**: an underline, a circle, an arrow, and optionally Lili's own signature traced from a scan.

## 7. Shape and components

Shape language: sharp corners (`--radius-card: 2px`), 1px hairlines, and an
inner **mat** (10–16px padding) around photographs, like a printed card.
There are no pills.

The components below are app-local in `apps/wedding/src/components/` unless noted otherwise.

| Component | Description |
| --- | --- |
| `InvitationCard` | Hairline frame with an inner mat; the base surface for vows, program, collections, and RSVP |
| `FramedPrint` | Photograph in a mat with a mono caption (time, place); optional slight rotation for "on the table" layouts |
| `Stamp` | Perforated-edge thumbnail (CSS mask), with an optional circular postmark (date, city) |
| `Timestamp` | The mono eyebrow `14:02 — FIRST LOOK`: time in `--accent`, label in `--muted` |
| `InkStroke` | Hand-drawn SVG path (underline, circle, arrow) that draws itself |
| `InkButton` | Solid accent rectangle with a mono uppercase label; outlined variant |
| `InkLink` | Text link whose ink underline draws on hover |
| `StoryCard` | Framed print, couple names in serif, place and season in mono, frame count |
| `MomentRow` | One timeline moment: photograph, time, one line |
| `ToastQuote` | Large serif quote with couple and place |
| `CollectionCard` | Place-card style: collection name, "from" price, inclusions |
| `FaqItem` | Question row with a `+` that rotates to `×`; height animated |
| `RsvpForm`, `Envelope` | Inquiry card and the sealing sequence |
| `ToneSection`, `DuskBand` | Section wrapper setting `data-tone`; the gradient between day and night |
| `WaxSeal` | **Moves to `@lili/ui`** from `apps/web/src/components/WaxSeal.tsx` so both apps share it |

Reused from shared code:

- `@lili/ui/lib/motion`
- `@lili/ui/components/ZoomableImage` (story lightbox)
- the `container-site`, `section-y`, `.tag-mono`, and `.grain` utilities (use `.grain` on night sections)

## 8. Motion

All motion uses `motion/react`, following the repository rule. Every effect
reads `useReducedMotion()` and falls back to a static end state. New timings
live in `apps/wedding/src/lib/motion.ts` and build on `EASE`.

| # | Effect | Where | Behaviour |
| --- | --- | --- | --- |
| 1 | **Scroll clock** | Hour by hour | `useScroll` over the section plus `useTransform` map progress to a time from 09:00 to 23:40 in the sticky mono clock, and switch the section from day to night at dusk |
| 2 | **Ink draw** | Headlines, links, program | `pathLength` 0 → 1 over about 0.9 s with `EASE` on view; the link underline draws on hover and retracts on leave |
| 3 | **Flash develop** | Night photographs | Enter overexposed (`brightness` about 2 → 1, opacity 0.4 → 1) over about 0.5 s, like a flash firing |
| 4 | **Print settle** | Day photographs, hero | Soft settle (`scale` 1.03 → 1, opacity); hero prints drop onto the table with a small rotation and a spring |
| 5 | **Seal the RSVP** | Form success | The card slides into the envelope, the flap closes, the wax seal presses with a "thunk", and the postmark stamps |
| 6 | **Reveals** | Everywhere else | `revealTransition` from `@lili/ui/lib/motion` |

Restraint rule: one signature effect per section, at most.

## 9. Imagery

- **Style:** documentary first, with a cinematic colour grade (Lili's signature).
- **Photo mix:** daylight frames for the day half, flash-lit and low-light frames for the night half.
- **Photos needed:**
  - hero: 3–5
  - timeline: 8, one per moment
  - featured full stories: 3, with 20–40 frames each
  - a portrait of Lili: 1
- **Delivery:** `next/image` with Supabase Storage or app-local assets, depending on the phase 05 decision. Keep the main site's `no-save` deterrence on photographs.

## 10. Voice and copy

- **Voice:** Lili's first person, warm and calm, with short lines. Reassuring for camera-shy couples ("You don't need to know how to pose").
- **Wedding words:** use them as section names: invitation, vows, toasts, program, RSVP, last dance.
- **Languages:** EN and Québec French at full parity, in `apps/wedding/messages/{en,fr}.json`. Keep accent words marked in the strings (`**simply**`), as on the main site.

Sample hero lines:

| EN | FR |
| --- | --- |
| You're invited to **simply** be there. | Vous êtes invités à **simplement** être là. |
| Now booking 2027 · 2028 | Réservations 2027 · 2028 |
| Check your date | Vérifier votre date |

## 11. Accessibility and performance

- Body text contrast is 4.5:1 or better in both tones.
- The focus ring uses `--accent`.
- The sticky clock is `aria-hidden`; the same times appear in plain text on each moment.
- The FAQ uses real disclosure buttons.
- Every form field has a label, errors are announced, and success is announced even when motion is reduced.
- No layout shift: fixed aspect ratios on every print and stamp.
- The scroll-driven effects animate only transform, opacity, and filter.

## 12. Sources

Roundups and guides:

- [Awwwards: Naba Zabih](https://www.awwwards.com/sites/naba-zabih)
- [Awwwards: Ethan Wong](https://www.awwwards.com/ethanwong/)
- [Site Builder Report: wedding photography websites](https://www.sitebuilderreport.com/inspiration/wedding-photography-websites)
- [Designers Up North: best wedding photographer websites](https://www.designersupnorth.com/best-wedding-photographer-websites/)
- [StyleCloud: fine art wedding photography websites](https://stylecloud.co/fine-art-wedding-photography-websites/)
- [Pixieset: website design trends](https://blog.pixieset.com/blog/website-design-trends/)
- [Arcadina: wedding photographers with unique portfolios](https://blog.arcadina.com/en/20-websites-of-wedding-photographers-with-unique-portfolios/)
- [Applet Studio: photographer website checklist](https://www.applet.studio/blog/photography-website-checklist)
- [Wedding website must-haves (UK)](https://agency-site-7to.pages.dev/blog/wedding-website-must-haves-uk)
- [Wedding photographer website guide (PH)](https://webdesignerph.pages.dev/articles/wedding-photographer-website-philippines)
- [Fat Cow Web Design: gallery layouts and booking pages](https://www.fatcowwebdesign.com/how-to-design-a-website-for-a-wedding-photographer-gallery-layouts-and-booking-pages/)
- [Loverly: wedding colour trends](https://loverly.com/planning/ideas/top-wedding-color-trends)

Sites inspected directly:

- ethanwong.photography, nabazabih.com, corbingurkin.com, jeremychou.com, laurencegibbs.com
- toastofleeds.co.uk, taliphotography.com, mati-photography.com, marcossanchez.net, samandsimonphotography.com
- adventureandvow.com, simondewey.co.uk, lovelycreatures.co.uk, maximebernadin.com, yidakistudio.com
- fabiomirulla.com, liamandbee.com, nomadlovestories.com, kimwilliamsweddings.com, johnandjoseph.com
- lukas-hanifle.com, anakete.com, danielevertelli.com, chasewild.com, nathanwalkerphotography.co.uk
- rachelburtphotography.com, louisegriffinphotography.com, cassandralane.co.uk
