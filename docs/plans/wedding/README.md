# Wedding site: master plan

> **Status: ready to build.** Decisions are taken (see
> [`02-design-decisions.md`](02-design-decisions.md)). Phases 05–12 are written
> and none is started. The app is still the noindex scaffold from
> [`../monorepo/08-wedding-app-scaffold.md`](../monorepo/08-wedding-app-scaffold.md).

This folder plans the wedding product on `apps/wedding` (`wedding.lilispics.com`):
a bilingual site that reads as a sibling of `lilispics.com`, told as one wedding
day that starts on paper in the morning and ends on the reception table at night.

It is written for an agent (Sonnet) that executes it phase by phase without the
conversation that produced it. Everything the agent needs is in these files or
in the code they point to.

## 1. Document map and precedence

| File | What it is |
| --- | --- |
| [`01-design-brief.md`](01-design-brief.md) | Research, concept and first spec (revision 3). **History.** Read §1–§2 for intent; do not build from its tables. |
| [`02-design-decisions.md`](02-design-decisions.md) | **Binding design spec.** Every decision, tokens, section map, components, motion. |
| [`03-guardrails.md`](03-guardrails.md) | **Anti-AI rules, truth rules, grep checks and the visual QA protocol.** Run after every phase. |
| [`04-copy-deck.md`](04-copy-deck.md) | Complete EN and Québec French copy, as the message JSON to paste. Facts still to confirm. |
| [`05-phase-foundations.md`](05-phase-foundations.md) | Phase 05 |
| [`06-phase-shell.md`](06-phase-shell.md) | Phase 06 |
| [`07-phase-home-day.md`](07-phase-home-day.md) | Phase 07 |
| [`08-phase-home-night.md`](08-phase-home-night.md) | Phase 08 |
| [`09-phase-stories-data.md`](09-phase-stories-data.md) | Phase 09 |
| [`10-phase-stories-pages.md`](10-phase-stories-pages.md) | Phase 10 |
| [`11-phase-reply-card.md`](11-phase-reply-card.md) | Phase 11 |
| [`12-phase-privacy-seo-docs.md`](12-phase-privacy-seo-docs.md) | Phase 12 |

When two documents disagree, the higher one wins:

1. [`AGENTS.md`](../../../AGENTS.md), except for the exceptions listed in §2 below
2. `02-design-decisions.md`
3. `03-guardrails.md`
4. `04-copy-deck.md`
5. the phase file
6. `01-design-brief.md`

If a phase step cannot be done as written (a file moved, an API differs in the
installed Next.js), **stop and ask** instead of improvising a different design.

## 2. Golden rules

- [`AGENTS.md`](../../../AGENTS.md) applies in full, with exactly these
  operator-approved exceptions for this plan:
  - **Commits.** Commit on `feat/wedding-design` at the end of every phase, then
    continue to the next phase without waiting. **Never push.** Never commit to
    `master`.
  - **Commands the agent may run itself:** `bun install`, `bun run lint`,
    `bun run typecheck`, `bun run build`, `bun run dev:wedding` (and
    `dev:web` / `dev:admin` for regression checks), `rg`, `git status|diff|log|add|commit`,
    and the Chrome browser tools for visual QA.
  - **Commands the agent must never run:** Supabase migrations or SQL against
    any database, `bun run seed`, Docker builds or deploys, `git push`,
    `git reset --hard`, anything that writes outside the repository.
  - **Dependencies.** The operator approved, for `apps/wedding` only:
    `motion ^12.40.0`, `react-hook-form ^7.77.0`, `@hookform/resolvers ^5.4.0`,
    `zod ^4.4.3` (the exact ranges in `apps/web/package.json`). Nothing else.
- Before touching Next.js code, read the relevant guide in
  `apps/web/node_modules/next/dist/docs/`. Next.js 16 calls request interception `proxy.ts`.
- **Tokens.** Wedding colour overrides live only in
  `apps/wedding/src/app/globals.css`. Never edit
  `packages/ui/src/styles/theme.css` or `base.css` for wedding needs, because
  they re-theme the portfolio and the admin.
- **Greys are true neutral** (R=G=B). The only colours are cognac (UI accent),
  cyanotype blue (stationery details only) and oxblood wax (the seal).
- **All animation through `motion/react`.** No CSS keyframes, no Tailwind
  `transition-*` / `animate-*`. Every effect honours `useReducedMotion()`.
- **EN/FR parity** in `apps/wedding/messages/{en,fr}.json`, always in the same
  commit.
- **Package boundaries.** Packages never import `@/`. No barrel files. Route
  files are shims. Server secrets are read inside functions.
- **The app stays `noindex`** until the operator's launch checklist (§6).
- **Truth.** Never ship invented testimonials, couples, statistics, press,
  prices or legal facts. See [`03-guardrails.md`](03-guardrails.md) §3.

## 3. How to run a phase

Do this loop for each phase, in order, without pausing between phases:

1. Read the phase file completely, then every file in its **Read first** list.
2. Check its **Preconditions**. If one fails, stop and report.
3. Do the steps in order. Paste copy from `04-copy-deck.md`; do not write new
   copy unless the phase says so.
4. Run the phase's **Verification**: `bun run lint`, `bun run typecheck`,
   `bun run build` from the repository root, plus any phase-specific checks.
   - Lint noise on files you did not touch: check `git ls-files --eol <file>`.
     `i/lf w/crlf` is a checkout artefact. Do not reformat unrelated files.
5. Run the **guardrail greps** in [`03-guardrails.md`](03-guardrails.md) §4. Fix every hit
   that is not on the allow-list.
6. Do the **visual QA** in `03-guardrails.md` §5 for every screen the phase
   changed, and write the answers into the phase report.
7. Update the status column of the phase table below (§4) in this README.
8. Commit with the phase's commit message (headline, blank line, `- ` bullets,
   blank line, `Co-Authored-By: Claude Sonnet <noreply@anthropic.com>` or the
   attribution line your harness gives you).
9. Write a short phase report in the chat:
   - what changed;
   - the QA answers;
   - anything left for the operator (🧑).

   Then continue with the next phase.

Stop the whole run and ask only when:

- a precondition fails;
- a step contradicts the installed code;
- a build or typecheck error is not yours to fix;
- the visual QA answer to question 1 in `03-guardrails.md` §5 is "no" and you cannot fix it inside the phase.

## 4. Phases

| # | Phase | Depends on | Database? | Status |
| --- | --- | --- | --- | --- |
| 05 | [Foundations](05-phase-foundations.md): deps, shared components moved to `@lili/ui`, tokens, primitives, placeholders, dev kit page | none | no | Done |
| 06 | [Shell](06-phase-shell.md): page top, floating menu, menu overlay, locale switcher, footer | 05 | no | Done |
| 07 | [Home, day half](07-phase-home-day.md): invitation hero, promises, hour by hour (scroll clock) | 06 | no | Done |
| 08 | [Home, night half](08-phase-home-night.md): about, testimonials (flash develop), order of service, collections, FAQ | 07 | no | Done |
| 09 | [Stories data](09-phase-stories-data.md): migration 0015, core data layer, revalidation, admin wedding panel | 05 | writes `0015` | Done |
| 10 | [Stories pages](10-phase-stories-pages.md): `/stories`, `/stories/[slug]`, lightbox, home stories section | 08, 09 | reads | Done |
| 11 | [Reply card](11-phase-reply-card.md): migration 0016, inquiry API, form, seal sequence, `/rsvp`, admin inbox | 08 | writes `0016` | Done |
| 12 | [Privacy, SEO, docs](12-phase-privacy-seo-docs.md): `/privacy`, metadata, sitemap (still noindex), documentation | 10, 11 | no | Not started |

**Migrations.** The agent writes the `.sql` files and keeps going. It never runs
them. Code must work before they are applied: the wedding data layer treats
Postgres errors `42703` (undefined column) and `42P01` (undefined table) as "no
data yet", returns an empty result and logs one warning. Features that need the
database are QA'd visually only after the operator applies the migration (🧑).

## 5. Inputs needed from Lili

| Input | Used in | Until then |
| --- | --- | --- |
| Wedding photographs: hero 1–3, hour by hour 8, portrait 1 | 07, 08 | Portfolio images copied to `apps/wedding/src/assets/placeholders/` (phase 05) |
| Full wedding stories (projects marked as wedding stories in the admin) | 10 | Stories sections and links stay hidden |
| Real "from" prices and add-on prices | 08 | Place cards show "On request" |
| Real testimonials from wedding couples, with consent | 08 | Section hidden in production |
| Approval of every line marked **to confirm** in `04-copy-deck.md` §6 (availability years, process timings, FAQ answers, budget ranges) | 07, 08, 11 | Draft copy, site stays noindex |
| Approval of the privacy policy text (Québec Law 25) | 12 | Draft text, site stays noindex |
| Optional: a scan of her signature | later | The wax seal uses `/logo.webp` |

## 6. 🧑 Launch checklist (operator only)

1. Apply `supabase/migrations/0015_wedding_stories.sql` and
   `0016_wedding_inquiries.sql` in the Supabase SQL editor, in order. Check
   [`../../database-and-storage.md`](../../database-and-storage.md) afterwards.
2. Set the wedding runtime env in Dokploy, and `WEDDING_URL` on the admin (see
   [`../../deployment.md`](../../deployment.md) after phase 12).
3. Send one test reply card in production. Check the admin inbox and the
   notification email.
4. Replace placeholder photos. Mark real stories in the admin. Fill prices and
   testimonials.
5. Get Lili's approval of the copy and the privacy text.
6. Remove `noindex`: delete `robots: { index: false, follow: false }` in
   `apps/wedding/src/app/[locale]/layout.tsx` and switch
   `apps/wedding/src/app/robots.ts` to allow plus the sitemap (phase 12
   leaves both as comments to flip).
7. Decide whether `lilispics.com` links to the wedding site (menu and footer). That is a
   separate change on `apps/web`.
