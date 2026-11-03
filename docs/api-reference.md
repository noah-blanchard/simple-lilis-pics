# API reference

Route handlers live in `packages/core/src/handlers/` and are mounted by one-line route files under `apps/<app>/src/app/api/`. Every handler uses a shared JSON envelope.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };
```

Validation failures use HTTP 422 with `VALIDATION_ERROR` and issue details. Invalid JSON/form data uses HTTP 400. Protected handlers return HTTP 401 `UNAUTHORIZED` without a valid Supabase user.

## Which app serves what

The API is split between two apps, each with its own base URL. A route called on the wrong origin returns 404 (or 405 for a method the app does not mount).

| App | Base URL | Serves |
| --- | --- | --- |
| `apps/web` | `https://lilispics.com` | The public writes and the revalidation webhook |
| `apps/wedding` | `https://wedding.lilispics.com` | The reply card endpoint and the revalidation webhook |
| `apps/admin` | `https://admin.lilispics.com` | Every authenticated route, plus `GET /api/projects` and `GET /api/tags` |

Admin client calls are same-origin from the CMS pages, and public client calls (contact form, rating submission, link beacons) are same-origin from the public site. The wedding app exposes only the routes listed for it above.

## Endpoint summary

| Method | Path | App | Auth | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/api/projects` | admin | None (only the admin calls it) | List projects |
| POST | `/api/projects` | admin | Required | Create project and optionally upload photos |
| PATCH | `/api/projects/[id]` | admin | Required | Edit project, tags, cover, and photo metadata |
| DELETE | `/api/projects/[id]` | admin | Required | Delete project and associated Storage objects |
| POST | `/api/projects/[id]/photos` | admin | Required | Upload one photo for sequential fallback |
| PATCH | `/api/projects/reorder` | admin | Required | Save featured order and tile widths |
| GET | `/api/tags` | admin | None (only the admin calls it) | List tags alphabetically |
| POST | `/api/tags` | admin | Required | Create a bilingual tag |
| PATCH | `/api/tags/[id]` | admin | Required | Update bilingual tag labels |
| DELETE | `/api/tags/[id]` | admin | Required | Delete a tag |
| POST | `/api/translate` | admin | Required | Translate admin text |
| GET | `/api/contact` | admin | Required | List private inquiries newest first |
| POST | `/api/contact` | web | Public | Store an inquiry and attempt notification email |
| PATCH | `/api/contact/[id]` | admin | Required | Mark an inquiry read or unread |
| DELETE | `/api/contact/[id]` | admin | Required | Delete an inquiry |
| GET | `/api/wedding-inquiries` | admin | Required | List private wedding reply cards newest first |
| POST | `/api/inquiry` | wedding | Public | Store a wedding reply card and attempt notification email |
| PATCH | `/api/wedding-inquiries/[id]` | admin | Required | Mark a reply card read or unread |
| DELETE | `/api/wedding-inquiries/[id]` | admin | Required | Delete a reply card |
| POST | `/api/rating-tokens` | admin | Required | Mint a single-use localized rating URL |
| GET | `/api/ratings` | admin | Required | List all ratings newest first |
| POST | `/api/ratings` | web | Public/token | Submit one rating |
| PATCH | `/api/ratings/[id]` | admin | Required | Approve or unapprove a rating |
| DELETE | `/api/ratings/[id]` | admin | Required | Delete a rating |
| GET | `/api/links` | admin | Required | Load the links editor snapshot and statistics |
| PUT | `/api/links` | admin | Required | Atomically save the complete links editor snapshot |
| POST | `/api/links/[id]/click` | web | Public/same-origin | Record a best-effort click on a published link |
| POST | `/api/links/socials/[id]/click` | web | Public/same-origin | Record a best-effort click on a published social link |
| POST | `/api/revalidate` | web, wedding | Bearer secret | Drop whitelisted public cache tags (called by the admin) |

## Projects

### `GET /api/projects`

Query parameters:

- `featured=true` filters to featured projects and applies manual order.
- `limit=N` applies a positive numeric result cap.

Returns resolved project rows with photos and tags, newest first when not governed by featured order. It is served by the admin app only.

### `POST /api/projects`

Consumes `multipart/form-data`:

- Repeated `files`: zero or more JPEG, PNG, WebP, or AVIF files, each at most 4 MiB. There is no photo-count limit. The client keeps a request under 4.5 MB (a limit inherited from the previous host, see [Troubleshooting](troubleshooting.md#upload-is-rejected)), so large galleries use the per-photo endpoint below.
- Repeated `orientation`: `landscape` or `portrait` aligned with files.
- Repeated `position`: zero-based integer aligned with files.
- `cover_index`: zero-based index into `files`.
- Optional `title_fr`, `title_en`, `description_fr`, `description_en`, and `project_date` (`YYYY-MM-DD`).
- `featured`: `true` or `false`.
- Repeated `tag_ids`: UUID values.

Zero files creates a metadata-only row for the sequential upload flow. Batch upload failures remove uploaded objects and the new project where possible. Returns HTTP 201 with the project ID.

### `PATCH /api/projects/[id]`

Consumes JSON with any of:

- Nullable localized title/description fields.
- Nullable `project_date`.
- `featured`.
- `tag_ids` UUID array.
- `cover_photo_id` belonging to this project.
- `photos` entries containing `id`, `position`, and `orientation`.
- Wedding-story fields: `wedding_story`, `wedding_slug`, `wedding_couple`, `wedding_venue`, `wedding_type`, `wedding_quote_en`, `wedding_quote_fr`. With `wedding_story: true`, the slug, couple and type must be non-null (`VALIDATION_ERROR` names each missing field).

Database errors map to `SLUG_TAKEN` (409, another story uses the address), `WEDDING_INCOMPLETE` (422) and `MIGRATION_PENDING` (409, migration 0015 not applied). Every successful project change (create, update, delete, photo upload) also asks the wedding site to drop its `public-weddings` cache.

The handler checks the featured cap and cover ownership. Tag replacement uses best-effort restoration if reinsertion fails.

### `DELETE /api/projects/[id]`

Fetches image paths, deletes the project (cascading relational rows), then removes bucket objects. Legacy full URLs are skipped. A Storage cleanup failure is logged after the successful database deletion.

### `POST /api/projects/[id]/photos`

Consumes multipart fields `file`, `orientation`, and `position`. It accepts exactly one supported file up to 4 MiB, verifies the project, uploads the object, and creates the photo row. Returns HTTP 201 with the photo ID.

### `PATCH /api/projects/reorder`

Consumes:

```json
{
  "items": [
    { "id": "project-uuid", "col_span": 2 }
  ]
}
```

The array contains 1–8 currently featured projects. Array index becomes `featured_order`; `col_span` must be 1–8.

## Tags

`GET /api/tags` returns all tags ordered by English label. It is served by the admin app only.

`POST /api/tags` requires non-empty `label_en` and `label_fr`. The slug is derived from English; a duplicate returns HTTP 409 `DUPLICATE_LABEL`.

`PATCH /api/tags/[id]` accepts either localized label. `DELETE` removes the tag and cascading project-tag links.

## Translation

`POST /api/translate` accepts:

```json
{
  "text": "Text to translate",
  "from": "en",
  "to": "fr",
  "kind": "title"
}
```

Text is trimmed and limited to 1–2000 characters. Languages must be `en` and `fr` and must differ. `kind` is `title`, `description`, or `tag`. Configuration errors return 500; upstream failures return a mapped status or 502.

## Contact

`POST /api/contact` (web) accepts `name` (1–200), valid `email` (maximum 320), `message` (10–5000), and optional hidden `company` (maximum 200).

A non-empty `company` is treated as a bot honeypot and receives a fake HTTP 201 success without storage. Real submissions are inserted before email is attempted. Resend failures are logged but the stored submission still receives HTTP 201.

`GET /api/contact` (admin) returns the authenticated inbox. `PATCH /api/contact/[id]` accepts `{ "read": boolean }` and sets or clears the server-generated `read_at` timestamp. `DELETE` permanently removes the inquiry.

## Wedding inquiries

`POST /api/inquiry` (wedding, public) accepts the reply card:

- `names` (1–200), valid `email` (maximum 320), `venue` (1–200);
- `wedding_date` (`YYYY-MM-DD`) or `date_unset: true`, one of them required;
- optional `guests`, `collection` and `budget` ranges (`null` when not chosen), `heard_from` (maximum 200) and `message` (maximum 5000);
- `consent: true`, `locale` (`en` or `fr`);
- the hidden `company` honeypot and `started_at` (milliseconds since epoch when the card was shown).

A non-empty `company`, or a `started_at` less than 3 seconds old, is treated as a bot and receives a fake HTTP 201 `{ id: "ok" }` without storage. Real submissions are inserted into `wedding_inquiries` before the email is attempted; a Resend failure is logged and the stored card still receives HTTP 201 with only the new `id`. Invalid payloads return 422 `VALIDATION_ERROR`; an insert failure returns 500 `DB_INSERT_FAILED` (this includes migration 0016 not being applied).

The admin lists, marks read or unread (`{ "read": true | false }`) and deletes cards through `/api/wedding-inquiries` and `/api/wedding-inquiries/[id]`, exactly like contact messages.

## Ratings

`POST /api/rating-tokens` (admin) accepts `{ "locale": "en" | "fr" }`. It creates a short single-use token with the database's 24-hour expiry and returns HTTP 201 with `token`, absolute `url`, and `expires_at`. The URL is built from `PORTFOLIO_URL`, so it points at the public site (`https://lilispics.com/rate/<locale>/<token>`), not at the admin.

`POST /api/ratings` (web) accepts:

```json
{
  "token": "short-rating-token",
  "stars": 5,
  "note": "Optional review up to 1000 characters",
  "name": "Optional name up to 80 characters",
  "company": ""
}
```

The public handler atomically claims an unused, unexpired token before inserting. Invalid, expired, used, or concurrently claimed tokens return HTTP 410 `TOKEN_INVALID`. Stars must be 1–5. A non-empty honeypot returns a fake success. Locale comes from the token rather than the request body.

`GET /api/ratings` (admin) returns every rating for moderation. `PATCH /api/ratings/[id]` accepts `{ "approved": boolean }`; approval gates stranger-written notes before public testimonial queries can read them. `DELETE` removes the rating but intentionally leaves its token spent.

## Links

`GET /api/links` (admin) returns `{ links, stats, socials, socialStats, settings }`. Links, social links, and the singleton settings include their `updated_at` versions. Both statistics arrays contain lifetime totals, current and previous seven-day counts, and the last click timestamp.

`PUT /api/links` (admin) consumes multipart form data. Its `snapshot` field contains the original `{id, updated_at}` lists for regular and social links, both complete ordered editor lists, original settings timestamp, focal coordinates, localized phrases, and `banner_action` (`keep`, `replace`, or `remove`). A `replace` request also includes `banner`, a JPEG, PNG, WebP, or AVIF file no larger than 4 MiB. Each array order becomes its collection's persisted zero-based position.

The database save reconciles regular links, social links, and settings in one transaction. If any version changed, it returns HTTP 409 `EDIT_CONFLICT` without partial database updates. A failed transaction removes a newly uploaded banner; a successful replacement removes the old Storage object afterward. After a successful save the handler asks the web app to drop its public links cache (see `POST /api/revalidate` below); that call is best effort and never fails the save.

Destinations are limited to HTTPS URLs, locale-neutral internal paths beginning with `/`, and simple `mailto:` addresses. At least one EN/FR name is required; optional blank text is stored as null.

Social destinations accept HTTPS and simple `mailto:` addresses, require a registered icon key and at least one EN/FR tooltip label, and do not accept internal paths.

### Click beacons

`POST /api/links/[id]/click` and `POST /api/links/socials/[id]/click` (web) require a same-origin browser request. They accept only published links, record the event and increment the lifetime counter, then return HTTP 202. Public anchors navigate directly to their destinations and never wait for this response.

The same-origin check (`isSameOriginRequest` in `@lili/core/api/same-origin`) returns HTTP 403 `FORBIDDEN` when:

- the `Origin` header is missing, or
- `Sec-Fetch-Site` is `cross-site`, or
- `Origin` matches neither the request URL's origin nor the public origin derived from the `X-Forwarded-Proto` and `X-Forwarded-Host` (or `Host`) headers.

Behind a TLS-terminating proxy such as Traefik, the Node server receives plain HTTP, so the forwarded headers are what make a browser's `https://` origin match. The check only stops other sites from inflating click counts; it is not an authentication boundary.

## Cache revalidation

`POST /api/revalidate` (web and wedding) is a server-to-server webhook called by the admin after a CMS mutation.

```http
POST /api/revalidate
Authorization: Bearer <REVALIDATE_SECRET>
Content-Type: application/json

{ "tags": ["public-links"] }
```

| Status | Meaning |
| --- | --- |
| 200 | `{ ok: true, data: { revalidated: ["public-links"] } }` |
| 400 | `INVALID_JSON`: the body is not JSON |
| 401 | `UNAUTHORIZED`: missing, malformed, or wrong bearer secret |
| 422 | `VALIDATION_ERROR`: `tags` is empty or contains a tag that is not whitelisted |
| 503 | `REVALIDATE_DISABLED`: `REVALIDATE_SECRET` is not configured on the server |

Only the tags listed in `PUBLIC_CACHE_TAGS` (`@lili/core/cache-tags`) are accepted; today those are `public-links` and `public-weddings`. The admin sends them to every origin in `PORTFOLIO_URL` and `WEDDING_URL`; an app ignores a tag it does not cache. `REVALIDATE_SECRET` must be identical in the admin, web and wedding apps. The secret is compared in constant time. Browsers never call this route.

## Client guidance

Use `@lili/core/api/client` inside the applications so error envelopes become useful exceptions. Do not call protected endpoints from untrusted automation with the service-role key; authenticate through Supabase and retain the session cookie for the admin origin.
