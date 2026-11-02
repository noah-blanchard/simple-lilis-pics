# 03 · Guardrails: not AI-looking, not untrue

> Run §4 and §5 at the end of **every** phase. The first style tile was
> rejected as "generic, AI-made design". These rules exist so that does not
> happen again. Most items below were seen in that review or are the most
> common tells of generated sites in 2025–2026.

The test behind every rule: **would a careful human designer who had studied
lilispics.com and real wedding stationery have made this choice?** If the only
reason for an element is "it looks designed", remove it.

## 1. Visual bans

| Banned | Why it reads as AI-made | Do instead |
| --- | --- | --- |
| Monospace anywhere (labels, times, counters, "01 / 12") | Mono was the strongest tell in the first review | Outfit for small text; Playfair figures for times |
| Uppercase letter-spaced eyebrow above every heading | The default "kicker + headline + lede" template | Capitals at most once per section, only on a stationery object (`02` §4) |
| Numbered markers (01, 02, 03) where order means nothing | Template rhythm | Nothing; or real times in hour by hour |
| Arrows in buttons and links (→ ↗ ›), `IconArrow` | Template CTA | Words only |
| Underlines of any kind, including hand-drawn or animated strokes | Rejected in review | Colour change on hover |
| Badges, chips, tags, dot pills, "New" labels | Dashboard UI | Plain words; italic for status |
| Gradient text, gradient blobs, orbs, mesh backgrounds | Generic hero filler | Photographs |
| Glassmorphism, `backdrop-blur` panels, glows (except the shared `AccentUnderline` pulse) | 2023 template look | Paper and shadow |
| Emoji, sparkles, icon-in-a-circle feature grids, 3-up icon cards | SaaS landing page | Text, photographs, stationery |
| Stat counters, "200+ weddings", "trusted by" logos, star ratings, initials avatars | Fabricated social proof | Real testimonials only (§3) |
| Hover lift + shadow on every card | Template interaction | Hover only where something is clickable, as a colour change |
| Bento grids, marquees, carousels with dots | Portfolio-template, and the portfolio already owns the bento | Prints, pairs, single photographs |
| Indigo, violet, purple, teal, any bright "screen blue" | The most common AI palette | Cognac + cyanotype ink only (`02` §3) |
| Dark canvas with a single bright accent | The common "premium dark" template | Night accent is paper white |
| CSS grain, noise, dot grids | Rejected in review | Texture comes from photographs |
| Everything centred; every section opened the same way | Monotony is a tell | Follow the opener column in `02` §6 |
| Scattered decorative stamps, tape, polaroids, postmarks | Over-themed | Stationery only where it does a job (`02` D9) |
| Script or handwriting fonts, florals, gold foil, blush | Wedding-template clichés | The portfolio fonts |
| Generated or stock placeholder images, CSS-gradient "image" boxes | Obviously fake | Lili's real portfolio photographs (`apps/wedding/src/assets/placeholders/`) |
| Rounded 28px cards (`rounded-card`) | Portfolio language, not paper | `02` §5 recipes |

## 2. Copy bans

The voice is Lili's: first person, warm, calm, short sentences, concrete details
(a parent checking the time, shoes off at midnight).

**Banned words and phrases** (EN, and their French equivalents):

> capture, captured, timeless, unforgettable, cherish, magic, magical, journey,
> elevate, seamless, bespoke, tailored, curated, storytelling, story-teller,
> authentic, passion, passionate, dream, dreamy, "moments that matter",
> "tell your story", "love story", "your special day", "once in a lifetime",
> "picture-perfect", "say cheese", "look no further"
>
> FR: immortaliser, intemporel, inoubliable, magique, sur mesure,
> passionnée, « votre jour J », « votre histoire d'amour », « moments précieux »

**Banned constructions:**

- em-dash asides (use commas, colons or full stops);
- "not just X, it's Y" and "more than X";
- rhetorical triplets ("honest, warm, and real");
- exclamation marks;
- questions as CTAs ("Ready to…?");
- "Let's…" CTAs;
- emoji;
- "we" when Lili means "I".

**Required:** times, years and prices in figures. French in Québec usage (`vous`;
narrow no-break space before `? ! : ;` and inside `« »`; `14 h 30`; `3 200 $`).

## 3. Truth rules

- **No invented testimonials, couples, names, venues, counts or press.** Testimonials ship as an empty array. The dev sample file is imported only under `process.env.NODE_ENV === "development"` and is labelled `DEV SAMPLE` in its code comments.
- **No invented prices.** `null` shows "On request".
- **No invented business facts.** Lines in the copy deck marked **to confirm** stay as written until Lili approves them. The site is noindex until then.
- **No invented legal facts.** The privacy page uses the copy-deck draft. Unknowns stay as the bracketed placeholders listed in `04-copy-deck.md` §6. Sonnet does not fill them in.
- **Placeholder photographs** come only from Lili's own images already in the repository. Alt text describes what is actually in the image: look at each file before you write it.

## 4. Grep checks (after every phase)

Run from the repository root. Every hit must be fixed or be on the allow-list.

```bash
# Run with the Bash tool (Git Bash). rg is available through the Grep tool too.
W="apps/wedding/src apps/wedding/messages"

rg -n "tag-mono|font-mono|JetBrains" $W                      # allow: none
rg -n "underline" $W                                         # allow: none (no-underline resets are not needed either)
rg -n "→|↗|›|IconArrow" $W                                   # allow: none
rg -n "—" apps/wedding/messages                              # allow: none
rg -n "backdrop-blur" $W                                     # allow: none
rg -n "bg-gradient|linear-gradient|radial-gradient" $W       # allow: DuskBand.tsx, PlaceCard.tsx (fold strip), SealedEnvelope.tsx (wax glow)
rg -n "transition-|@keyframes|animate-" $W                   # allow: none
rg -n -i "indigo|violet|purple|teal|sky-|blue-" $W           # allow: none
rg -n "rounded-full" $W                                      # allow: LocaleSwitcher.tsx, FloatingMenuButton.tsx, SealedEnvelope.tsx (glow + ripple), Postmark.tsx
rg -n "rounded-card|rounded-2xl|rounded-xl" $W               # allow: none
rg -n "!\"|!<|! \"" apps/wedding/messages                    # exclamation marks: allow none
rg -n -i "captur|timeless|unforgettable|cherish|magic|journey|elevate|seamless|bespoke|tailored|curated|storytell|authentic|passion|dream|special day|immortalis|intemporel|inoubliable|magique|sur mesure|jour J" apps/wedding/messages
```

Also, for EN/FR parity:

```bash
bun -e 'const a=require("./apps/wedding/messages/en.json"),b=require("./apps/wedding/messages/fr.json");const k=(o,p="")=>Object.entries(o).flatMap(([x,v])=>v&&typeof v==="object"&&!Array.isArray(v)?k(v,p+x+"."):[p+x]);const A=new Set(k(a)),B=new Set(k(b));console.log("missing in fr:",[...A].filter(x=>!B.has(x)));console.log("missing in en:",[...B].filter(x=>!A.has(x)));'
```

Both lists must be empty. Arrays must have the same length in both files.

## 5. Visual QA protocol (after every phase that changes a screen)

1. Start `bun run dev:wedding` in the background (port 3052). Load the Chrome
   tools in one ToolSearch call, as the browser instructions say.
2. Open a new tab. For each changed route, take screenshots:
   - at **1440×900** and **390×844** (resize the window);
   - in **EN** (`/`) and **FR** (`/fr`);
   - with **reduced motion** (emulate through `javascript_tool` only if available; otherwise read the code path and say so).
3. Open `https://lilispics.com` at the same sizes and compare it with the wedding screenshots side by side.
4. For the three signature effects (scroll clock, flash develop, seal), record a GIF with `gif_creator` and name it, for example `wedding-scroll-clock.gif`.
5. Answer these ten questions **in the phase report**. A "no" to Q1, or a "yes" to Q2–Q4, must be fixed before committing.

| # | Question |
| --- | --- |
| Q1 | Placed next to lilispics.com, does this look like the same photographer's site? |
| Q2 | Is there an element whose only purpose is to look designed? |
| Q3 | Does any section open the same way as the section before it? |
| Q4 | Does anything from §1 appear (mono, eyebrow, arrow, underline, pill outside the allowed ones, gradient, glow, icon grid)? |
| Q5 | Is the accent (cognac on paper, white italic at night) used at most about twice per viewport? |
| Q6 | Is the cyanotype blue used only on stationery details? |
| Q7 | Does every photograph keep its aspect ratio without layout shift while loading? |
| Q8 | At 390px wide: no horizontal scroll, tap targets at least 44px, the clock readable and not hidden by the menu button? |
| Q9 | Keyboard: is the focus ring visible on every interactive element, and can the menu, FAQ, lightbox and form be used without a mouse? |
| Q10 | Read the copy aloud: does it sound like one person talking, with no banned words or constructions from §2? |

Close the browser tab and stop the dev server at the end of the phase.
