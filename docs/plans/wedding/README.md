# Wedding site: master plan

> **Status: design phase.** The design brief (phase 01) is written. Nothing
> below phase 01 is built yet.

This folder plans the wedding product on `apps/wedding` (`wedding.lilispics.com`).
Today the app is the bilingual, noindex scaffold from
[`../monorepo/08-wedding-app-scaffold.md`](../monorepo/08-wedding-app-scaffold.md).
It has one placeholder page.

## Golden rules

- [`AGENTS.md`](../../../AGENTS.md) applies in full: architecture boundaries,
  Bun/Biome workflow, motion/react for all animation, EN/FR parity, staged
  confirmation. The agent commits only when the operator says so for that
  phase; otherwise it suggests a commit message.
- [`01-design-brief.md`](01-design-brief.md) is the visual and content source
  for every later phase. If a phase needs to deviate from it, stop and ask; do
  not drift silently.
- Run one phase per session. Stop at the end of each phase, report what changed,
  and wait for the operator to confirm.
- The wedding app keeps its own look through **token overrides** in
  `apps/wedding/src/app/globals.css`. Do not edit
  `packages/ui/src/styles/theme.css` for wedding needs, because that file
  re-themes the portfolio and the admin too.
- Grays stay true neutral (R=G=B). The only colour is the cyanotype blue, used
  as ink on paper (plus the shared oxblood wax seal).
- Respect the "What we do not do" list in the brief (§11): no monospace, no
  underlines, no times in words, no pills, no CSS grain, no screen blues.
- The app stays `noindex` until phase 07.

## Style tile

A private visual companion to the brief is published at
<https://claude.ai/artifact/8P66PL87YZDXkdAJgx8FaX>. It is the third proof, in
French. It shows:

- the paper and table colours, with the cyanotype blue;
- the lilispics.com fonts (Playfair Display, Outfit) in their wedding roles;
- the stationery components;
- the dusk band, in neutral and cyanotype versions;
- working demos of the scroll clock, the flash develop, and the reply-card
  seal.

The images are Lili's portfolio photographs, used as stand-ins until wedding
photographs exist. The tile is a throwaway prototype written in plain CSS and
the Web Animations API. The app itself must use motion/react.

## Phases

| # | Phase | Scope | Status |
| --- | --- | --- | --- |
| 01 | [Design brief](01-design-brief.md) | Research, section map, tokens, typography, components, motion, imagery, voice | Revision 3; awaiting review |
| 02 | Foundations | Wedding token overrides and `[data-tone="night"]` scope; fonts stay the portfolio ones already in `apps/wedding/src/lib/fonts.ts`; add `motion` (`^12.40.0`, same range as `@lili/ui`) to `apps/wedding/package.json` after approval, with `bun.lock` checked; move `WaxSeal` from `apps/web` to `@lili/ui` | Not started |
| 03 | Shell | Top bar, menu overlay (invitation index), locale switcher, footer ("Last dance") | Not started |
| 04 | Home sections | The ten home sections from the brief, with static EN/FR copy and placeholder images | Not started |
| 05 | Stories | Content model for full wedding stories (Supabase + admin, or static); `/stories` and `/stories/[slug]` | Needs a decision |
| 06 | RSVP backend | Inquiry handler in `@lili/core/handlers`, persistence, best-effort Resend notification, mirroring the contact flow | Not started |
| 07 | Launch | Remove noindex, metadata, sitemap, docs (`architecture.md`, `content-and-i18n.md`, `deployment.md`) | Not started |

## Inputs needed from Lili

- Photographs:
  - hero: 3–5
  - hour-by-hour timeline: 8
  - full stories: 3, with 20–40 frames each
  - portrait: 1
- Real starting prices, add-on prices, and booking years.
- Approved EN and FR copy for the vows, the process, and the FAQ answers.
- Optionally, a scan of her handwritten signature (to become an SVG ink stroke).
