# API reference

All handlers live under `src/app/api/` and use a shared JSON envelope.

```ts
type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; details?: unknown } };
```

Validation failures use HTTP 422 with `VALIDATION_ERROR` and issue details. Invalid JSON/form data uses HTTP 400. Protected handlers return HTTP 401 `UNAUTHORIZED` without a valid Supabase user.

## Endpoint summary

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/projects` | Public | List projects |
| POST | `/api/projects` | Required | Create project and optionally upload photos |
| PATCH | `/api/projects/[id]` | Required | Edit project, tags, cover, and photo metadata |
| DELETE | `/api/projects/[id]` | Required | Delete project and associated Storage objects |
| POST | `/api/projects/[id]/photos` | Required | Upload one photo for sequential fallback |
| PATCH | `/api/projects/reorder` | Required | Save featured order and tile widths |
| GET | `/api/tags` | Public | List tags alphabetically |
| POST | `/api/tags` | Required | Create a bilingual tag |
| PATCH | `/api/tags/[id]` | Required | Update bilingual tag labels |
| DELETE | `/api/tags/[id]` | Required | Delete a tag |
| POST | `/api/translate` | Required | Translate admin text |
| GET | `/api/contact` | Required | List private inquiries newest first |
| POST | `/api/contact` | Public | Store an inquiry and attempt notification email |
| PATCH | `/api/contact/[id]` | Required | Mark an inquiry read or unread |
| DELETE | `/api/contact/[id]` | Required | Delete an inquiry |
| POST | `/api/rating-tokens` | Required | Mint a single-use localized rating URL |
| GET | `/api/ratings` | Required | List all ratings newest first |
| POST | `/api/ratings` | Public/token | Submit one rating |
| PATCH | `/api/ratings/[id]` | Required | Approve or unapprove a rating |
| DELETE | `/api/ratings/[id]` | Required | Delete a rating |
| GET | `/api/links` | Required | Load the links editor snapshot and statistics |
| PUT | `/api/links` | Required | Atomically save the complete links editor snapshot |
| POST | `/api/links/[id]/click` | Public/same-origin | Record a best-effort click on a published link |

## Projects

### `GET /api/projects`

Query parameters:

- `featured=true` filters to featured projects and applies manual order.
- `limit=N` applies a positive numeric result cap.

Returns resolved project rows with photos and tags, newest first when not governed by featured order.

### `POST /api/projects`

Consumes `multipart/form-data`:

- Repeated `files`: zero to four JPEG, PNG, WebP, or AVIF files, each at most 5 MiB.
- Repeated `orientation`: `landscape` or `portrait` aligned with files.
- Repeated `position`: integer 0–3 aligned with files.
- `cover_index`: integer 0–3.
- Optional `title_fr`, `title_en`, `description_fr`, `description_en`, and `project_date` (`YYYY-MM-DD`).
- `featured`: `true` or `false`.
- Repeated `tag_ids`: UUID values.

Zero files creates a metadata-only row for the sequential upload recovery flow. Batch upload failures remove uploaded objects and the new project where possible. Returns HTTP 201 with the project ID.

### `PATCH /api/projects/[id]`

Consumes JSON with any of:

- Nullable localized title/description fields.
- Nullable `project_date`.
- `featured`.
- `tag_ids` UUID array.
- `cover_photo_id` belonging to this project.
- `photos` entries containing `id`, `position`, and `orientation`.

The handler checks the featured cap and cover ownership. Tag replacement uses best-effort restoration if reinsertion fails.

### `DELETE /api/projects/[id]`

Fetches image paths, deletes the project (cascading relational rows), then removes bucket objects. Legacy full URLs are skipped. A Storage cleanup failure is logged after the successful database deletion.

### `POST /api/projects/[id]/photos`

Consumes multipart fields `file`, `orientation`, and `position`. It accepts exactly one supported file up to 5 MiB, verifies the project, uploads the object, and creates the photo row. Returns HTTP 201 with the photo ID.

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

`GET /api/tags` returns all tags ordered by English label.

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

`POST /api/contact` accepts `name` (1–200), valid `email` (maximum 320), `message` (10–5000), and optional hidden `company` (maximum 200).

A non-empty `company` is treated as a bot honeypot and receives a fake HTTP 201 success without storage. Real submissions are inserted before email is attempted. Resend failures are logged but the stored submission still receives HTTP 201.

`GET /api/contact` returns the authenticated inbox. `PATCH /api/contact/[id]` accepts `{ "read": boolean }` and sets or clears the server-generated `read_at` timestamp. `DELETE` permanently removes the inquiry.

## Ratings

`POST /api/rating-tokens` accepts `{ "locale": "en" | "fr" }`. It creates a short single-use token with the database's 24-hour expiry and returns HTTP 201 with `token`, absolute `url`, and `expires_at`.

`POST /api/ratings` accepts:

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

`GET /api/ratings` returns every rating for moderation. `PATCH /api/ratings/[id]` accepts `{ "approved": boolean }`; approval gates stranger-written notes before public testimonial queries can read them. `DELETE` removes the rating but intentionally leaves its token spent.

## Client guidance

Use `src/lib/api/client.ts` inside the application so error envelopes become useful exceptions. Do not call protected endpoints from untrusted automation with the service-role key; authenticate through Supabase and retain the session cookie.

## Links

`GET /api/links` returns `{ links, stats }`. Links include their `updated_at`
version. Statistics contain lifetime total, current and previous seven-day
counts, and the last click timestamp.

`PUT /api/links` accepts the original `{id, updated_at}` list plus the complete
ordered editor list. Array order becomes the persisted zero-based position.
The save creates new rows, updates retained rows, and deletes omitted rows in
one transaction. If the database no longer matches the original snapshot it
returns HTTP 409 `EDIT_CONFLICT` without applying a partial update.

Destinations are limited to HTTPS URLs, locale-neutral internal paths beginning
with `/`, and simple `mailto:` addresses. At least one EN/FR name is required;
optional blank text is stored as null.

`POST /api/links/[id]/click` requires a same-origin browser request. It accepts
only published links, records the event and increments the lifetime counter,
then returns HTTP 202. Public anchors navigate directly to their destinations
and never wait for this response.
