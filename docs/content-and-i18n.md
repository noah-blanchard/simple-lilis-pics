# Content and internationalization

## Content sources

The public site combines checked-in marketing content with runtime portfolio content:

- `apps/web/messages/en.json` and `apps/web/messages/fr.json` contain the portfolio site's localized marketing copy.
- `apps/web/src/data/` contains typed lists and identifiers for navigation, specialties, plans, process steps, and social links.
- Supabase stores project content, featured settings, public links, click statistics, contact messages, rating tokens, and moderated ratings.
- `apps/web/public/` contains checked-in static images and decorative assets.
- `apps/wedding/messages/en.json` and `fr.json` contain the wedding site's copy (namespaces `meta`, `nav`, `hero`, `promises`, `day`, `stories`, `about`, `words`, `process`, `collections`, `questions`, `reply`, `privacy` and `footer`).

Do not move runtime CMS content into message files or fetch static marketing lists from Supabase without an explicit architecture change.

## Locale routing

Routing is shared by every localized app. `packages/core/src/i18n/routing.ts` (`@lili/core/i18n/routing`) defines:

- Locales: `en` and `fr`.
- Default locale: `en`.
- Prefix strategy: `as-needed`.

Therefore English uses `/`, `/portfolio`, `/links`, and `/portfolio/[id]`, while French uses `/fr`, `/fr/portfolio`, `/fr/links`, and `/fr/portfolio/[id]`. The wedding app uses the same rule (`/` and `/fr`).

Each localized app wires next-intl itself: `src/i18n/request.ts` (loads that app's `messages/<locale>.json`), `src/i18n/navigation.ts`, and `src/proxy.ts`. `apps/web/src/proxy.ts` sends public requests through next-intl and lets `/rate/*` through untouched. The admin is English-only and has no localized routing.

## Editing marketing copy

1. Add or change the same key in both message catalogs **of the same app**.
2. Preserve nesting and value types at key parity. Each app checks its own parity: web's `en.json`/`fr.json` against each other, and wedding's against each other.
3. Use the correct next-intl namespace in the consuming section/page.
4. Check both the English unprefixed URL and the French `/fr` URL.
5. Review metadata when a title, description, or public route meaning changes.

Tags and projects are not maintained in the message catalogs. Their bilingual fields are edited through the admin.

Public link names, subtitles, localized welcome phrases, and the banner are runtime CMS content too. Static links-page metadata, introduction, empty/error copy, and accessibility labels live in the `links` namespace in web's message catalogs.

## Runtime localization and fallback

The public data resolver receives a locale and selects the matching project/title description and tag label. When localized project text is absent, it falls back to the other language and finally to a neutral project label. Photos and dates are shared across languages.

The links resolver uses the same locale-first fallback for names and subtitles. Destinations, registered icons, positions, publication state, and opening behavior are shared across languages.

Admin translation buttons can translate titles, descriptions, and tag labels in either direction. Translation is assistance, not publication workflow automation: review the output before saving.

The rating experience carries its language explicitly in `/rate/en/[token]` or `/rate/fr/[token]` rather than through the normal next-intl prefix. Approved ratings with written notes feed the public testimonials section in their recorded locale. The section stays hidden until at least three qualifying ratings exist.

## The wedding site

`apps/wedding` is the bilingual wedding site, **noindex** until the operator's launch checklist ([the wedding plan](plans/wedding/README.md) §6).

- **Voice.** The complete EN and Québec French copy lives in [the copy deck](plans/wedding/04-copy-deck.md): Lili speaking in the first person, short sentences, concrete details, and the banned words and constructions listed in [the guardrails](plans/wedding/03-guardrails.md). Lines about her business are drafts until she confirms them.
- **Québec typography.** French uses `vous`, a narrow no-break space before `? ! : ;` and inside guillemets, and times and prices as `14 h 30` and `3 200 $`.
- **Formatting helpers.** Times, prices, seasons and long dates come from `apps/wedding/src/lib/format.ts`, never hand-built strings.
- **Message parity.** Keys in `messages/en.json` and `fr.json` stay in parity, including array lengths.
- **Stories.** Story content is not in messages: it comes from portfolio projects marked as wedding stories in the admin (couple, address, venue, type and quotes). Testimonials (`words.items`) ship empty and the section stays hidden until real ones exist; prices in `src/data/collections.ts` are `null` ("On request") until confirmed.
- **Photographs.** Placeholders are Lili's own portfolio images in `src/assets/placeholders/`, with alt text in `src/data/placeholder-photos.ts`.

## Static assets

Under `apps/web/public/`:

- `hero-carousel/` contains hero images.
- `about/` contains the about image.
- `illustrations/` contains decorative photography objects.
- Root-level `process-*.png` files illustrate process stages.
- `logo.webp` and `apps/web/src/app/favicon.ico` provide branding. The admin keeps its own copies (`apps/admin/public/logo.webp` for the links-editor preview, and a favicon), and the wedding app has its own favicon.

Preserve meaningful filenames, image aspect ratios, and optimized formats. Runtime uploads belong in Supabase Storage, not `public/`.

## SEO

Localized layouts and portfolio pages generate metadata. `apps/web/src/app/sitemap.ts` creates:

- Both locale variants of the home and portfolio pages.
- Both locale variants of the links page.
- Both locale variants of every project.
- Language alternate links.

`NEXT_PUBLIC_SITE_URL` must be each app's own production origin for correct canonical, Open Graph, and sitemap URLs (`https://lilispics.com` for web). The public portfolio site does not publish a `robots.txt` today. The admin layout sets `noindex, nofollow` and its `robots.txt` disallows everything; the wedding app does the same until launch.

## Content checklist

- English and French message keys remain identical within each app.
- Both locale routes render and navigation keeps the locale.
- Project text reads naturally in both languages.
- New public pages have metadata and sitemap coverage where appropriate.
- Asset URLs resolve through Next Image configuration.
- No visitor data, secrets, or private admin content enters checked-in copy.
