# Content and internationalization

## Two content sources

The public site combines checked-in marketing content with runtime portfolio content:

- `messages/en.json` and `messages/fr.json` contain localized marketing copy.
- `src/data/` contains typed lists and identifiers for navigation, specialties, plans, process steps, reviews, and social links.
- Supabase stores project content, featured settings, public links, click statistics, contact messages, rating tokens, and moderated ratings.
- `public/` contains checked-in static images and decorative assets.

Do not move runtime CMS content into message files or fetch static marketing lists from Supabase without an explicit architecture change.

## Locale routing

`src/i18n/routing.ts` defines:

- Locales: `en` and `fr`.
- Default locale: `en`.
- Prefix strategy: `as-needed`.

Therefore English uses `/`, `/portfolio`, `/links`, and `/portfolio/[id]`, while French uses `/fr`, `/fr/portfolio`, `/fr/links`, and `/fr/portfolio/[id]`.

`src/proxy.ts` sends public requests through next-intl. Admin routes remain English-only and outside localized routing.

## Editing marketing copy

1. Add or change the same key in both message catalogs.
2. Preserve nesting and value types at key parity.
3. Use the correct next-intl namespace in the consuming section/page.
4. Check both the English unprefixed URL and the French `/fr` URL.
5. Review metadata when a title, description, or public route meaning changes.

Tags and projects are not maintained in the message catalogs. Their bilingual fields are edited through the admin.

Public link names and subtitles are runtime CMS content too. Static links-page
metadata, introduction, empty/error copy, and accessibility labels live in the
`links` namespace in both message catalogs.

## Runtime localization and fallback

The public data resolver receives a locale and selects the matching project/title description and tag label. When localized project text is absent, it falls back to the other language and finally to a neutral project label. Photos and dates are shared across languages.

The links resolver uses the same locale-first fallback for names and subtitles.
Destinations, registered icons, positions, publication state, and opening
behavior are shared across languages.

Admin translation buttons can translate titles, descriptions, and tag labels in either direction. Translation is assistance, not publication workflow automation: review the output before saving.

The rating experience carries its language explicitly in `/rate/en/[token]` or `/rate/fr/[token]` rather than through the normal next-intl prefix. Approved ratings with written notes feed the public testimonials section in their recorded locale. The section stays hidden until at least three qualifying ratings exist.

## Static assets

- `public/hero-carousel/` contains hero images.
- `public/about/` contains the about image.
- `public/illustrations/` contains decorative photography objects.
- Root-level `public/process-*.png` files illustrate process stages.
- `public/logo.webp` and `src/app/favicon.ico` provide branding.

Preserve meaningful filenames, image aspect ratios, and optimized formats. Runtime uploads belong in Supabase Storage, not `public/`.

## SEO

Localized layouts and portfolio pages generate metadata. `src/app/sitemap.ts` creates:

- Both locale variants of the home and portfolio pages.
- Both locale variants of the links page.
- Both locale variants of every project.
- Language alternate links.

`NEXT_PUBLIC_SITE_URL` must be the production origin for correct canonical, Open Graph, and sitemap URLs. The admin layout sets `noindex, nofollow`.

## Content checklist

- English and French message keys remain identical.
- Both locale routes render and navigation keeps the locale.
- Project text reads naturally in both languages.
- New public pages have metadata and sitemap coverage where appropriate.
- Asset URLs resolve through Next Image configuration.
- No visitor data, secrets, or private admin content enters checked-in copy.
