# Phase 12: Privacy, SEO and documentation

> Read [`README.md`](README.md) first. This phase assumes its golden rules.
> **`noindex` stays on.** This phase prepares the launch; the operator flips it.

## Goal

Finish the wedding site so it is ready to launch:

- the `/privacy` page the reply card links to;
- complete metadata (titles, descriptions, language alternates, Open Graph);
- a sitemap that is built but not yet advertised;
- the project documentation updated to the final state;
- one last full-site QA pass.

## Preconditions

- [ ] Phases 10 and 11 are committed.

## Read first

- The `privacy` and `meta` namespaces of [`04-copy-deck.md`](04-copy-deck.md), and §6 there (the privacy placeholders stay as they are)
- The installed Next.js guides for the Metadata API, `sitemap.ts` and `robots.ts` under `apps/web/node_modules/next/dist/docs/`
- `apps/web/src/app/sitemap.ts` and `robots.ts` if they exist (`rg --files apps/web/src/app | rg "sitemap|robots"`), so the conventions match
- `docs/architecture.md`, `docs/content-and-i18n.md`, `docs/deployment.md`, `docs/local-development.md`, the root `README.md`

---

## Part A: `/privacy`

1. Paste the `privacy` namespace into both message files.
2. `apps/wedding/src/data/legal.ts`:

   ```ts
   /** Date the privacy text last changed. Update it with every wording change. */
   export const PRIVACY_UPDATED = "2026-11-02";
   ```

   Set it to the date of this phase.
3. `app/[locale]/privacy/page.tsx` (server):

   ```text
   <PageTop />
   <main id="main">
     <Tone tone="day" className="section-y pt-12 md:pt-16">
       container-site → article.mx-auto max-w-[44em]
         h1.display-xl text-[clamp(40px,5vw,72px)]   {title}
         p.mt-4 italic text-muted   {updated, with formatLongDate(PRIVACY_UPDATED, locale)}
         p.mt-10 text-body-fluid text-fg/80   {intro}
         for each section:
           h2.display mt-14 text-[clamp(26px,2.4vw,34px)]   {heading}
           p.mt-4 text-fg/80 (per body paragraph, space-y-4)
     </Tone>
   </main>
   ```

   Render the bracketed placeholders exactly as written. They are visible on purpose until Lili
   confirms the facts, and the site stays noindex until then.
4. `generateMetadata` from `meta.privacyTitle` and `meta.privacyDescription`.

## Part B: Metadata

### B1. Layout (`app/[locale]/layout.tsx`)

```ts
return {
  metadataBase: new URL(SITE_URL),
  title: { default: t("title"), template: `%s · ${t("title")}` },
  description: t("description"),
  openGraph: { type: "website", siteName: t("title"), locale: locale === "fr" ? "fr_CA" : "en_CA", images: [{ url: heroImage.src, width: heroImage.width, height: heroImage.height }] },
  // Launch checklist (docs/plans/wedding/README.md §6): delete this line to allow indexing.
  robots: { index: false, follow: false },
};
```

`heroImage` is `PLACEHOLDERS[HERO_PHOTO].src`, the static import. Replace it when real photos arrive.

### B2. Per page

Every page's `generateMetadata` returns:

- its `title` (the template adds the suffix);
- its `description`;
- `alternates: { canonical, languages: { en, fr } }`, built with `getPathname` from `@/i18n/navigation` for both locales.

| Page | Title | Description |
| --- | --- | --- |
| `/` | default (no `title` key) | `meta.description` |
| `/stories` | `meta.storiesTitle` | `meta.storiesDescription` |
| `/stories/[slug]` | the couple | the venue and season; `openGraph.images` is the cover |
| `/rsvp` | `meta.rsvpTitle` | `meta.rsvpDescription` |
| `/privacy` | `meta.privacyTitle` | `meta.privacyDescription` |

## Part C: Sitemap and robots

1. `apps/wedding/src/app/sitemap.ts`. List, for both locales, `/`, `/stories`, every story (`getWeddingStories("en")`), `/rsvp` and `/privacy`:
   - absolute URLs from `NEXT_PUBLIC_SITE_URL`;
   - `alternates.languages`.

   Use the same structure as the portfolio's sitemap if it has one.
2. `apps/wedding/src/app/robots.ts`: keep `disallow: "/"`. Below it, add the launch version as a comment:

   ```ts
   // Launch (README §6): replace with
   // return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
   ```

## Part D: Documentation (final state)

Update these to describe the wedding site **as built**. Keep each change concise and link to this plan
for design rationale instead of copying it.

| File | Change |
| --- | --- |
| `README.md` (root) | The wedding app row and description (no longer a scaffold); add its routes under "Routes"; the repository map line; local URL text |
| `docs/architecture.md` | The system overview row; the wedding request flow (pages, `POST /api/inquiry`, `POST /api/revalidate`, reads through `@lili/core/data/weddings`); route organisation for `apps/wedding`; cache revalidation now targets `PORTFOLIO_URL` and `WEDDING_URL`; styling: wedding token scopes (`data-tone`) live in the app's `globals.css` |
| `docs/content-and-i18n.md` | Replace "The wedding scaffold" with "The wedding site": message namespaces, the copy deck as the voice reference, Québec typography conventions, formatting helpers, and the fact that stories come from projects marked in the admin |
| `docs/deployment.md` | Wedding runtime env (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `REVALIDATE_SECRET`); `WEDDING_URL` on the admin; wedding smoke tests (home, a story, `/rsvp` submit, admin inbox); and how noindex is lifted |
| `docs/local-development.md` | Wedding env variables; migrations 0015 and 0016 in the database setup list |
| `docs/troubleshooting.md` | Two entries: "Wedding stories don't appear" (migration 0015, `wedding_story` flag, the cache lasts up to 300 s, `WEDDING_URL` and `REVALIDATE_SECRET` on the admin) and "Reply card fails with DB_INSERT_FAILED" (migration 0016, service role key) |
| `docs/plans/wedding/README.md` | Status → "Built; awaiting launch inputs"; every phase row → Done |

Check every path, command and variable name you write with `rg`. Run `git diff --check`.

## Part E: Final QA pass

1. `bun run lint`, `bun run typecheck`, `bun run build`.
2. All greps and the parity check.
3. Production build check:
   - run `cd apps/wedding; bun run start` in the background;
   - check that `/`, `/fr`, `/stories`, `/rsvp`, `/privacy`, `/kit` (must 404), `/sitemap.xml` and `/robots.txt` (must disallow) behave as expected;
   - check that `<meta name="robots" content="noindex, nofollow">` is in the HTML of every page;
   - stop the server.
4. A full visual pass of every route at 1440 and 390, EN and FR, with Q1–Q10 answered once for the
   whole site. Compare the home page side by side with lilispics.com one last time.
5. Keyboard-only pass: skip link → menu → FAQ → reply card → lightbox (if stories exist).

## Definition of done

- [ ] `/privacy` is live in both languages, linked from the reply card and the footer.
- [ ] Metadata, alternates and Open Graph are on every page. The sitemap is built. Robots and meta are still noindex.
- [ ] The root README and the docs describe the final state. The wedding README marks every phase done.
- [ ] Lint, typecheck and build pass. The final QA answers are in the report.

## Commit message

```text
Prepare the wedding site for launch

- Add the privacy policy page in English and French (draft, pending Lili's review)
- Add page metadata, language alternates and Open Graph images
- Add the sitemap and the commented launch version of robots.txt (still noindex)
- Document the wedding site across the README, architecture, content, deployment and troubleshooting guides
```

After this commit, the agent's work is done. Hand over to the operator's launch checklist in
[`README.md`](README.md) §6.
