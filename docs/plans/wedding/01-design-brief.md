# Phase 01: design brief — "The invitation, day to night"

> Read [`README.md`](README.md) first. This brief is the visual and content
> source for phases 02–07.
>
> **Revision 3 (after two style-tile reviews).**
>
> The first proof read as generic, AI-made design. The reviewer pointed at:
> - the fonts;
> - the rounded badge with a coloured dot;
> - the monospace times and numbers;
> - the indigo/periwinkle blue;
> - the grey dot texture on the black sections.
>
> The second proof went too far the other way. The operator then decided:
> - keep the **lilispics.com fonts** (Playfair Display, Outfit);
> - use **no underlines at all**, hand-drawn or otherwise;
> - keep **times as figures**, not written out in words.
>
> §11 lists what we do not do.

## 1. Intent

`wedding.lilispics.com` should feel like it comes from the same photographer as
`lilispics.com`, but it should tell a different story. The portfolio is a calm, neutral **gallery**.
The wedding site is **wedding stationery that lives through one day**:

- the top of the page is the paper itself, printed like an invitation;
- the middle turns through dusk;
- the bottom is the **dark reception table at night**, with paper cards laid on it (the order of service, place cards, the reply card) and flash-lit photographs.

It says "wedding" through printed objects and their conventions:

- invitation wording;
- place cards, the order of service, and the reply card;
- the wax seal;
- "something blue", here a cyanotype blue.

It does **not** use the usual wedding signals (blush, gold foil, script fonts,
florals, beige), and it avoids the generic AI-made look listed in §11.

## 2. Research findings

About 30 wedding-photographer sites were inspected through their HTML and CSS
(fonts, colours, headings), along with six curated roundups (see §13).

### 2.1 What the category looks like

- **Palette:** ivory, blush, beige, or greige, with gold or brown accents. Sage is the "modern" variant.
- **Type:** Cormorant, Cinzel, Trajan, Playfair, or EB Garamond, often set in tracked capitals, plus a script font for names and Raleway or Montserrat for body text. Examples: Jeremy Chou (Cinzel + Cormorant), Corbin Gurkin (Trajan + Playfair), and John & Joseph (Cormorant).
- **Builders:** most sites run on Showit, Squarespace, or StyleCloud templates. Layouts repeat: a full-bleed slideshow, a centred serif tagline, a three-column "portfolio / about / inquire" block, and an Instagram strip.

### 2.2 Sites that stand out, and the idea worth taking

| Site | What makes it different | Idea we keep |
| --- | --- | --- |
| [Ethan Wong](https://ethanwong.photography) | Parchment and ink, numbered index, live quote calculator, transparent pricing | Honest "from" prices |
| [Marcos Sanchez](https://marcossanchez.net) | Saol serif + Dia grotesk, cream with an oxblood accent, press logos | A single deep accent on a quiet canvas |
| [Louise Griffin](https://louisegriffinphotography.com) | Roman-numeral index, 35mm film nostalgia, lyrical copy | Archival, printed-matter framing |
| [Toast of Leeds](https://www.toastofleeds.co.uk) | Black and mustard, loud headlines, "Choose your adventure" cards that lead to pricing | Wedding-type entry points; confident voice |
| [Simon Dewey](https://www.simondewey.co.uk) | "Love having your photo taken? Me neither."; 35mm film add-on; grouped FAQ | Reassurance for camera-shy couples; film add-on |
| [Liam + Bee](https://liamandbee.com) | Coverage shown as a figure (85% documentary / 10% portraits / 5% groups) | Coverage as a fact, written as a sentence |
| [Jeremy Chou](https://www.jeremychou.com) | Manifesto, process, "15 weddings a year at most", upcoming destinations | Scarcity; process as a section |
| [Rachel Burt](https://rachelburtphotography.com), [Cassandra Lane](https://www.cassandralane.co.uk) | Bold colour (pink, red, teal) | Colour works when it has a reason |

### 2.3 Sections couples expect

These sections recur across the strong sites and the conversion-focused guides:

- a hero with availability;
- an approach or manifesto;
- **full wedding stories**, not only loose photos;
- an about section;
- the experience, from inquiry to gallery;
- **starting prices** (one vendor survey says many couples won't inquire without them);
- testimonials;
- press or awards;
- a grouped FAQ;
- an inquiry form that qualifies the lead (date, venue, guest count, budget);
- scarcity;
- wedding-type entry points (elopement, intimate, full day).

### 2.4 The gap we take

Nobody does real printed stationery conventions without the gold and blush. Almost
nobody uses blue. Nobody tells the **day hour by hour** as the backbone of the page.

## 3. Kinship with lilispics.com

| Kept (brand DNA) | Changed (wedding feeling) |
| --- | --- |
| Fonts: Playfair Display + Outfit (§6) | No monospace on the wedding site |
| Wax seal object, oxblood `#a8462b` | Accent: cyanotype blue instead of cognac, used only on paper |
| `EASE` and timings from `@lili/ui/lib/motion` | Canvas: paper by day, a dark table by night, instead of gallery gray |
| `container-site` and `section-y` rhythm | Shapes: paper objects (prints, stamps, cards, envelope) instead of the bento grid, pills, and 28px cards |
| Italic accent words (`renderAccentLine` grammar); Lili's warm first-person voice, her colour grade | Typography set like stationery: centred invitation wording, place cards, an order of service |

## 4. Information architecture

### 4.1 Home: the order of the day

Home is one long scroll. The sections follow the day, but times are **not** shown
as eyebrow labels on every section. Time appears where it carries meaning: in the
hour-by-hour section, in photo captions, and on the order of service.

| # | Section | Tone | Content |
| --- | --- | --- | --- |
| 00 | **The invitation** (hero) | paper | Set like a real invitation, centred (see §10 for the wording). Availability is one line in the text ("Dates open in 2027 and 2028"). One solid button, *Check your date*, and one plain text link, *See the stories*. Beside it, three prints and a stamp laid on the table. |
| 01 | **My promises** (approach) | paper | Three short vows set as display lines, separated by a short hairline rule. Coverage as a sentence: "About eight photographs in ten are taken as they happen, with no posing." |
| 02 | **Stories** | paper | Three prints. Captions are written like the back of a photograph: names, place, season, number of photographs. Wedding-type filter as plain words: the active one is in ink, the others muted. Each story links to `/stories/[slug]`. |
| 03 | **The day, hour by hour** | paper → dusk → table | **Signature section.** A large clock in Playfair figures, Québec style ("14 h 30", EN "2:30 pm"), with the part of the day in italic beside it ("in the afternoon"). It changes as eight moments scroll past: getting ready, first look, ceremony, family, portraits, golden hour, speeches, last dance. One photograph and one line each. The paper turns to the night table at dusk. It doubles as "what I cover". |
| 04 | **Hello** (about) | table | Portrait, short bio, link to `lilispics.com` ("the rest of my work"). |
| 05 | **Toasts** (testimonials) | table | Large display quotes, couple names in roman, place and date in italic, plain text buttons "Previous" and "Next". Two flash-lit photographs beside them. |
| 06 | **The order of service** (experience) | paper card on the table | Each step: when (italic, blue), what (display), why (one line). Steps: you write to me → a 30-minute call within 48 hours → reserve (contract + retainer) → plan together → the day → a sneak peek after three days → the full gallery after about six weeks, then the album. |
| 07 | **Three ways to be there** (collections) | place cards on the table | "Table 1 / 2 / 3" folded place cards: **Elopement**, **Intimate** (up to 6 h), **Full day** (about 10 h). "From" prices in display figures. Add-ons as one sentence below. Real prices to be supplied by Lili. |
| 08 | **Good to know** (FAQ) | table | Groups and seed questions are in §4.3. |
| 09 | **Reply card** (RSVP) | paper card on the table | Form described in §4.4. Submitting seals an envelope with the wax seal. |
| — | **The last dance** (footer) | table | Availability, email, Instagram, EN/FR, link back to `lilispics.com`, legal links. |

### 4.2 Other routes (later phases)

| Route | Purpose |
| --- | --- |
| `/stories` | Index of full weddings, filterable by type |
| `/stories/[slug]` | One wedding told in time chapters, with mixed layouts (full-bleed, pair, triptych, pull quote from the couple) and a lightbox |
| `/experience` | Full collections, order of service, and FAQ (home shows summaries) |
| `/rsvp` | The reply card on its own page |

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

### 4.4 Reply card fields

The card is headed "Kindly reply" / « Réponse souhaitée ». Fields are written on ruled lines, with italic labels.

- Your names
- Email
- Wedding date, with a "not set yet" option
- Venue or city
- Guests (range)
- Collection
- Budget (range)
- How did you hear about me?
- Message
- Privacy consent, with a link to the privacy policy (Québec Law 25)

It should take about a minute to fill in. The submit control is the wax seal itself, labelled "Seal and send".

## 5. Colour

The colours are **tokens with the same names as `packages/ui/src/styles/theme.css`**,
so the shared utilities (`bg-ink`, `text-fg`, `text-accent`, `border-line`, …)
keep working. The wedding app overrides them in its own `globals.css`.

The night is a **token scope** on a section (`data-tone="night"`) that redefines the
same variables. A paper card placed on the table is its own `data-tone="day"`
scope, so it keeps paper colours.

| Token | Paper (day) | Table (night) | Role |
| --- | --- | --- | --- |
| `--bg` | `#f8f8f8` | `#141414` | Canvas |
| `--panel` | `#ffffff` | `#1d1d1d` | Cards, prints (paper stays white) |
| `--line` | `#dcdcdc` | `#303030` | Hairlines |
| `--line-strong` | `#8a8a8a` | `#6b6b6b` | Ruled form lines |
| `--muted` | `#5b5b5b` (6.4:1) | `#a0a0a0` (7.0:1) | Secondary text |
| `--fg` | `#161616` (17:1) | `#ededed` (15.7:1) | Text |
| `--accent` | `#1b4a72` (8.7:1) | — | **Cyanotype blue**, ink on paper only |
| `--accent-strong` | `#12344f` | — | Hover |
| Wax seal | `#a8462b` / `#722c19` | same | Shared object colour, never used for UI text |

Rules:

- **Grays are true neutral (R=G=B).** The only colour in the interface is the cyanotype blue.
- **The blue is ink.** It appears only on paper: italic accent words, the "when" line in the order of service, prices, the clock, and postmarks. The solid button turns blue on hover. It never fills an area. It never appears on the dark table; there, accents are italic in paper white.
- **Why cyanotype:** the cyanotype (1842) is one of the first photographic printing processes. Its Prussian blue gives the photographer's "something blue" a reason.
- **Dusk band:** a tall gradient from paper to table inside the hour-by-hour section.
  - The default is **neutral**.
  - A cyanotype-tinted variant is shown on the style tile, to be judged by eye.
- **No textures generated in CSS.** No dot grain and no noise overlays. Texture comes from the photographs and the letterpress type.

## 6. Typography

**The lilispics.com families**, already declared in `apps/wedding/src/lib/fonts.ts`
(the scaffold copied them from the portfolio). The wedding site gets its own
feeling from layout, paper, and colour, not from new typefaces.

| Role | Family | Use |
| --- | --- | --- |
| Display | **Playfair Display** 400, normal + italic | Headlines set large, invitation lines, quotes, prices, the clock, couple names. Italic accent words take the blue on paper. |
| Text | **Outfit** (300–600) | Paragraphs, captions, form labels, buttons |
| Capitals | Playfair Display in uppercase, 0.08em tracking | At most once per section: the host line of the invitation, the reply-card heading, FAQ group names |

Rules:

- **No monospace.** JetBrains Mono stays loaded only if a shared component needs it. The wedding pages never use `.tag-mono`, mono timestamps, or mono labels.
- **Times and numbers are figures.** French follows Québec usage ("14 h 30", "3 200 $" with narrow no-break spaces); English uses "2:30 pm" and "$3,200". The large clock uses `tabular-nums` so it does not jitter while scrolling.
- **No underlines anywhere**, neither CSS `text-decoration` nor hand-drawn SVG strokes. Links show their state through colour (muted to ink on hover). The main call to action is a solid button.

## 7. Components

Shape language: paper objects with real proportions, white prints with a mat and
a soft cast shadow, and a perforated stamp. There are no pills, no rounded cards,
and no bordered chips.

The components below are app-local in `apps/wedding/src/components/` unless noted otherwise.

| Component | Description |
| --- | --- |
| `Invitation` | Centred hero block in invitation wording (§10) |
| `Button` | Solid ink fill, 2px radius, Outfit label in sentence case, no arrow; turns cyanotype blue on hover. One per section at most. |
| `TextLink` | Plain text in muted colour that turns to ink on hover, with no underline. Also used for filters and toggles (`aria-pressed`). |
| `Print` | Photograph on white paper with a mat and an italic handwritten-style caption; optional slight rotation |
| `Stamp` | Perforated thumbnail with an optional circular postmark (city, date) |
| `Clock` | Formats a time in figures for EN or FR; helper in `apps/wedding/src/lib/format-time.ts` |
| `Vow` | Display line plus one sentence; vows separated by a short hairline rule |
| `StoryPrint` | `Print` plus a caption written like the back of a photo |
| `Moment` | One hour-by-hour moment: photograph, time, title, one line |
| `ToastQuote` | Display quote, names in roman, place and date in italic |
| `PaperCard` | A white card on the night table (order of service, reply card) |
| `OrderOfService` | Steps with when (blue italic), what (display), and why |
| `PlaceCard` | Folded place card: "table one", name in italic, "from" price, inclusions |
| `FaqItem` | Display-size question with a plain "+" glyph that turns to "×"; height animated |
| `ReplyCard`, `Envelope` | The form on ruled lines; the wax-seal submit button; the sealing sequence |
| `ToneSection`, `DuskBand` | Section wrapper setting `data-tone`; the gradient between day and night |
| `WaxSeal` | **Moves to `@lili/ui`** from `apps/web/src/components/WaxSeal.tsx`, so both apps share it |

Reused from shared code: `@lili/ui/lib/motion`, `@lili/ui/components/ZoomableImage`
(story lightbox), `container-site`, and `section-y`.

## 8. Motion

All motion uses `motion/react`, following the repository rule. Every effect reads
`useReducedMotion()` and falls back to a static end state. New timings live in
`apps/wedding/src/lib/motion.ts` and build on `EASE`.

| # | Effect | Where | Behaviour |
| --- | --- | --- | --- |
| 1 | **Scroll clock** | Hour by hour | `useScroll` + `useTransform` map scroll progress to a time from 9 h to 23 h 40 (rounded to five minutes) in tabular Playfair figures; the paper darkens to the table in the second half |
| 2 | **Flash develop** | Night photographs | Enter overexposed (`brightness` about 2.6 → 1) over about 0.6 s, like a flash firing |
| 3 | **Prints settle** | Hero, stories | Prints drop onto the table with a small rotation and a spring |
| 4 | **Seal the reply** | Reply card | The card slides into the envelope, the flap closes, the seal presses with a "thunk", and the postmark stamps |
| 5 | **Reveals** | Elsewhere | `revealTransition` from `@lili/ui/lib/motion` |

At most one signature effect per section.

## 9. Imagery

- **Style:** documentary first, with a cinematic colour grade (Lili's signature).
- **Photo mix:** daylight frames for the paper half, flash-lit and low-light frames for the table half.
- **Photos needed:**
  - hero: 3–5
  - hour by hour: 8, one per moment
  - featured stories: 3, with 20–40 frames each
  - a portrait of Lili: 1
- **Placeholders:** until wedding photographs exist, use Lili's portfolio images (the style tile does this). Never use generated placeholders or CSS gradients.
- **Delivery:** `next/image` with Supabase Storage or app-local assets, depending on the phase 05 decision. Keep the main site's `no-save` deterrence on photographs.

## 10. Voice and copy

- **Voice:** Lili's first person, warm and calm, with short lines. Reassuring for camera-shy couples ("You don't need to know how to pose").
- **Stationery conventions:** invitation wording in the hero, place cards, the order of service, "Kindly reply". Times, years, and prices stay in figures.
- **Languages:** EN and Québec French at full parity, in `apps/wedding/messages/{en,fr}.json`. Accent words stay marked in the strings (`**simply**`), as on the main site.
- **French typography:** narrow no-break spaces before `:`, `?`, `!`, `;`, and inside « ».

Hero wording:

| EN | FR |
| --- | --- |
| LILI, PHOTOGRAPHER *(capitals)* | LILI, PHOTOGRAPHE |
| *is delighted to invite you* | *a le plaisir de vous inviter* |
| to **simply** be there | à **simplement** être là |
| *on your wedding day,* | *le jour de votre mariage,* |
| in Montréal, elsewhere in Québec, or wherever you say yes. | à Montréal, ailleurs au Québec, ou là où vous direz oui. |
| Dates open in 2027 and 2028 | Dates libres en 2027 et 2028 |
| Check your date *(button)* · See the stories *(text link)* | Vérifier votre date · Voir les histoires |

## 11. What we do not do

These patterns read as generic, AI-made design, or the operator rejected them in review:

- **Type:** monospace for labels, times, or numbers; uppercase letter-spaced eyebrows above every heading; switching away from the lilispics.com fonts.
- **Underlines:** any underline, CSS or hand-drawn ("felt-pen" strokes), including animated ones and decorative ink ornaments.
- **Times in words:** times and years stay in figures.
- **Badges:** pills or chips with a coloured status dot, and bordered tag chips.
- **Buttons:** arrows ("→") in buttons or links.
- **Colour:** indigo, periwinkle, or any "screen blue". The near-black canvas with a single bright accent on it.
- **Texture:** dot grids, grain, or noise overlays generated in CSS.
- **Layout:** the same "eyebrow + giant headline + lede" opener on every section; numbered "01 / 02 / 03" markers where the order means nothing; stat bars and dashboard-style figures; tick-mark icon lists.
- **Copy:** em-dash asides and "not X, but Y" slogans.

## 12. Accessibility and performance

- **Contrast:** body text is 4.5:1 or better in both tones; see the ratios in §5.
- **Focus:** the focus ring is a thin cyanotype outline.
- **Scroll clock:** it is `aria-hidden`; every moment also shows its own time as text.
- **FAQ:** uses real disclosure buttons.
- **Forms:** every field has a label, errors are announced, and success is announced even when motion is reduced.
- **Layout stability:** fixed aspect ratios on every print and stamp.
- **Animation cost:** the scroll-driven effects animate only transform, opacity, and filter. The fonts are the ones the portfolio already ships.

## 13. Sources

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
