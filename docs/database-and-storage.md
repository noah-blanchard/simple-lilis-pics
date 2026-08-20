# Database and storage

## Migration policy

Apply `supabase/migrations/` in numeric order. They are the schema history:

| Migration | Result |
| --- | --- |
| `0001_init.sql` | Creates tags and an initial photo-centric model |
| `0002_storage.sql` | Creates the public `photos` bucket and object policies |
| `0003_projects.sql` | Drops the initial photo model and creates the active project-centric model |
| `0004_featured_cap_8.sql` | Raises the database featured-project guard to eight |
| `0005_featured_order.sql` | Adds manual featured ordering and backfills it |
| `0006_contact_messages.sql` | Adds private durable contact submissions |
| `0007_featured_col_span.sql` | Adds featured bento tile width, constrained to 1–8 |
| `0008_ratings.sql` | Adds single-use 24-hour rating tokens and moderated ratings |
| `0009_contact_message_read.sql` | Adds persistent contact read/unread state |

The active schema does **not** include the `photos` or `photo_tags` tables created by migration 0001; migration 0003 drops them.

## Active tables

### `tags`

Bilingual taxonomy with `id`, unique `slug`, `label_fr`, `label_en`, and `created_at`.

### `projects`

Project metadata:

- Nullable EN/FR titles and descriptions.
- Optional `project_date`.
- `featured` flag with an eight-project guard.
- Nullable `cover_photo_id`.
- Nullable `featured_order`.
- `featured_col_span` from 1 to 8, defaulting to 2.
- `created_at`.

### `project_photos`

One row per gallery image with an owning project, Storage object key or legacy full URL, `landscape`/`portrait` orientation, zero-based position, and timestamp. The API enforces no more than four photos per project.

### `project_tags`

Many-to-many link between projects and tags with a composite primary key. Links cascade when either side is deleted.

### `contact_messages`

Private visitor inquiries containing name, email, message, creation timestamp, and nullable `read_at`.

### `rating_tokens`

Short, unique EN/FR codes for QR links. Each expires after 24 hours and records `used_at` when atomically claimed. Authenticated users manage tokens; public clients never read them directly.

### `ratings`

One rating per token with 1–5 stars, optional note/name, recorded locale, moderation flag, and timestamp. Deleting a token preserves its rating by setting `token_id` to null.

## Relationships

```text
projects 1 ─── * project_photos
    │                  │
    └── cover_photo_id ┘  (ON DELETE SET NULL)

projects * ─── * tags
          project_tags
```

Deleting a project cascades its photo and tag-link rows. The API separately removes non-legacy Storage objects because database cascades cannot delete bucket objects.

## Row Level Security

- Public/anon users can read projects, project photos, tags, and project-tag links.
- Authenticated users have table write policies for CMS data.
- Contact messages have authenticated read access only and no public insert/update/delete policy.
- Only approved ratings are publicly readable; authenticated users can moderate ratings and manage tokens.
- The public contact route inserts with the server-only service-role client.
- Storage objects in the configured bucket are publicly readable; authenticated policies permit object writes.

The service-role key bypasses RLS. It must stay server-only.

## Featured constraints

The maximum of eight featured projects is enforced in the admin UI, API handlers, and a Postgres trigger. Manual order is stored as a zero-based `featured_order`. Bento width is stored as `featured_col_span`; row height is derived from the cover orientation.

## Storage

The default bucket is `photos` and may be overridden by `NEXT_PUBLIC_SUPABASE_BUCKET`. Uploaded records store only object keys. `resolveImageUrl` builds public URLs from the configured Supabase origin and bucket. Full `http(s)` URLs remain untouched for legacy/demo images.

`next.config.ts` derives the allowed Supabase image hostname from `NEXT_PUBLIC_SUPABASE_URL` at build time. Changing Supabase projects requires rebuilding the application.

## Operational safety

- Never edit an applied migration to change production history; add a new numbered migration.
- Test destructive SQL and seed actions against a disposable project first.
- `bun run seed --force` wipes project data and bypasses RLS; it does not seed or clear messages/ratings.
- Database deletion may leave an object orphan only when Storage cleanup fails; route code logs that condition.
- Back up production data before destructive maintenance.
