# Phase 09: Stories data

> Read [`README.md`](README.md) first. This phase assumes its golden rules.
> **Write the migration; never run it.**

## Goal

Let Lili turn any portfolio project into a **wedding story** from the admin, and
let the wedding app read those stories through a cached public data layer. Admin edits
must refresh the wedding site's cache. Everything must keep working before the migration is
applied.

**Out of scope:** the wedding pages that display stories (phase 10), chapters (D11), and
marking a story while creating a project. The wedding panel is **edit-only**: create the project
first, then mark it. Project creation is a multipart upload, and keeping it unchanged keeps
this phase small.

## Preconditions

- [ ] Phase 05 is committed. Phases 06–08 may or may not be done; this phase does not depend on them.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) D11
- `supabase/migrations/0003_projects.sql`, `0007_featured_col_span.sql` (an idempotent `alter` style)
- `packages/core/src/types/db.ts` (`ProjectRow`, `resolveProject`, `resolveImageUrl`)
- `packages/core/src/data/{parse,projects,links}.ts` (`links.ts` is the `unstable_cache` + public client pattern)
- `packages/core/src/api/schemas.ts`, `packages/core/src/handlers/{project-by-id,projects,project-photos}.ts`
- `packages/core/src/{cache-tags,revalidate}.ts`, `packages/core/src/handlers/revalidate.ts`
- `apps/web/src/app/api/revalidate/route.ts`
- `apps/admin/src/components/admin/{ProjectForm,TranslatableField}.tsx`, `apps/admin/src/components/admin/projects/AdminProjectCard.tsx`
- `docs/database-and-storage.md`, `docs/api-reference.md`, `docs/admin-guide.md`

---

## Part A: Migration `supabase/migrations/0015_wedding_stories.sql`

```sql
-- 0015 · Wedding stories reuse portfolio projects.
-- A project becomes a story on wedding.lilispics.com when wedding_story is true.
-- Idempotent: safe to re-run. Public read is inherited from "public read projects".
-- See docs/plans/wedding/02-design-decisions.md (D11).

alter table public.projects
  add column if not exists wedding_story    boolean not null default false,
  add column if not exists wedding_slug     text,
  add column if not exists wedding_couple   text,
  add column if not exists wedding_venue    text,
  add column if not exists wedding_type     text,
  add column if not exists wedding_quote_en text,
  add column if not exists wedding_quote_fr text;

alter table public.projects drop constraint if exists projects_wedding_type_check;
alter table public.projects add constraint projects_wedding_type_check
  check (wedding_type is null or wedding_type in ('elopement', 'intimate', 'full_day'));

alter table public.projects drop constraint if exists projects_wedding_slug_format;
alter table public.projects add constraint projects_wedding_slug_format
  check (wedding_slug is null or wedding_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- A published story needs an address, names and a type.
alter table public.projects drop constraint if exists projects_wedding_story_complete;
alter table public.projects add constraint projects_wedding_story_complete
  check (not wedding_story or (wedding_slug is not null and wedding_couple is not null and wedding_type is not null));

create unique index if not exists projects_wedding_slug_key
  on public.projects (wedding_slug) where wedding_slug is not null;

create index if not exists projects_wedding_story_idx
  on public.projects (project_date desc nulls last) where wedding_story;
```

Do not add policies. The existing `public read projects` and `auth write projects` cover the new
columns.

## Part B: Core types and parsing

### B1. `packages/core/src/api/schemas.ts`

Next to the project schemas:

```ts
/* ── Weddings ── */

export const WEDDING_TYPES = ["elopement", "intimate", "full_day"] as const;
export type WeddingType = (typeof WEDDING_TYPES)[number];

const WEDDING_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Wedding-story fields on a project (edit-only; the admin sends all of them together). */
export const projectWeddingSchema = z.object({
  wedding_story: z.boolean(),
  wedding_slug: z.string().trim().max(80).regex(WEDDING_SLUG, "Use lowercase letters, numbers and dashes").nullable(),
  wedding_couple: z.string().trim().max(120).nullable(),
  wedding_venue: z.string().trim().max(160).nullable(),
  wedding_type: z.enum(WEDDING_TYPES).nullable(),
  wedding_quote_en: z.string().trim().max(400).nullable(),
  wedding_quote_fr: z.string().trim().max(400).nullable(),
});
```

Extend `projectUpdateSchema` with `.extend(projectWeddingSchema.partial().shape)`, then add a
`.superRefine` that, **when `wedding_story === true`**, requires a non-null
`wedding_slug`, `wedding_couple` and `wedding_type`, and reports each missing one on its own path. This
mirrors the database check and gives the admin field-level errors.

### B2. `packages/core/src/types/db.ts`

Add to `ProjectRow`:

```ts
  wedding_story: boolean; // shown on wedding.lilispics.com as a story
  wedding_slug: string | null;
  wedding_couple: string | null;
  wedding_venue: string | null;
  wedding_type: WeddingType | null;
  wedding_quote_en: string | null;
  wedding_quote_fr: string | null;
```

Import `WeddingType` as a type from `../api/schemas`. Check this does not create an import cycle at
runtime; a type-only import is erased.

### B3. `packages/core/src/data/parse.ts`

Add the fields to `projectWithRelations` with **defaults**, so rows from a database without
migration 0015 still parse cleanly:

```ts
  wedding_story: z.boolean().default(false),
  wedding_slug: z.string().nullable().default(null),
  wedding_couple: z.string().nullable().default(null),
  wedding_venue: z.string().nullable().default(null),
  wedding_type: z.enum(WEDDING_TYPES).nullable().catch(null).default(null),
  wedding_quote_en: z.string().nullable().default(null),
  wedding_quote_fr: z.string().nullable().default(null),
```

The portfolio does not use these fields. Its output must not change.

## Part C: Cache tag and revalidation targets

1. `packages/core/src/cache-tags.ts`:

   ```ts
   export const PUBLIC_CACHE_TAGS = ["public-links", "public-weddings"] as const;
   …
   export const PUBLIC_WEDDINGS_TAG: PublicCacheTag = "public-weddings";
   ```

2. `packages/core/src/revalidate.ts`:

   ```ts
   /** Public app origins that cache CMS data: the portfolio and the wedding site. */
   function revalidationTargets(): string[] {
     return [process.env.PORTFOLIO_URL, process.env.WEDDING_URL].filter((url): url is string => Boolean(url));
   }
   ```

   Update the warning text to name both variables. Both apps accept both tags. Dropping a tag
   an app does not use is harmless.

3. Wedding route shim: create `apps/wedding/src/app/api/revalidate/route.ts`, identical to
   `apps/web/src/app/api/revalidate/route.ts`. The wedding `proxy.ts` matcher already excludes
   `/api`.

4. Call `await requestPublicRevalidation([PUBLIC_WEDDINGS_TAG])` after each **successful** project
   mutation:

   | Handler | Where |
   | --- | --- |
   | `createProject` (`handlers/projects.ts`) | after the photos and cover are written |
   | `updateProject` (`handlers/project-by-id.ts`) | before the final `apiSuccess` |
   | `deleteProject` (same file) | before the final `apiSuccess` |
   | `uploadProjectPhotos` (`handlers/project-photos.ts`) | before its success response |

   Any project can become a story, so revalidating on every project change is the simple rule.
   The call is best-effort and never throws.

## Part D: Errors in `updateProject`

The wedding fields are part of `scalarFields`, so they flow into the existing update.
Map the database errors:

```ts
if (updateErr) {
  if (updateErr.code === "23505") return apiError("SLUG_TAKEN", "Another wedding story already uses this address", 409);
  if (updateErr.code === "23514") return apiError("WEDDING_INCOMPLETE", "A wedding story needs an address, the couple's names and a type", 422);
  if (updateErr.code === "42703") return apiError("MIGRATION_PENDING", "Wedding fields need migration 0015 to be applied", 409);
  return apiError("DB_UPDATE_FAILED", updateErr.message, 500);
}
```

## Part E: Data layer `packages/core/src/data/weddings.ts`

```ts
import { unstable_cache } from "next/cache";
import type { WeddingType } from "../api/schemas";
import { PUBLIC_WEDDINGS_TAG } from "../cache-tags";
import type { Locale } from "../i18n/routing";
import { createSupabasePublicClient } from "../supabase/public";
import { type ProjectWithRelations, type ResolvedProjectPhoto, resolveProject } from "../types/db";
import { PROJECT_SELECT, parseProjects } from "./parse";

/** A wedding story as the wedding site renders it. */
export interface ResolvedWeddingStory {
  slug: string;
  couple: string;
  venue: string; // "" when unset
  type: WeddingType;
  date: string | null; // ISO date; the app derives the season
  quote: string; // locale-specific; "" when unset
  cover: ResolvedProjectPhoto | null;
  photos: ResolvedProjectPhoto[];
}

let warnedMissingSchema = false;

/** Postgres "undefined column" / "undefined table": migration 0015 is not applied yet. */
function isMissingSchema(code: string | undefined) {
  return code === "42703" || code === "42P01";
}

const getStoryRows = unstable_cache(
  async (): Promise<ProjectWithRelations[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("wedding_story", true)
      .order("project_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      if (isMissingSchema(error.code)) {
        if (!warnedMissingSchema) console.warn("[weddings] migration 0015 not applied; no stories yet");
        warnedMissingSchema = true;
        return [];
      }
      throw new Error(`Failed to load wedding stories: ${error.message}`);
    }
    return parseProjects(data);
  },
  ["wedding-stories"],
  { tags: [PUBLIC_WEDDINGS_TAG], revalidate: 300 },
);

function resolveStory(row: ProjectWithRelations, locale: Locale): ResolvedWeddingStory | null {
  // The database check guarantees these on stories; skip anything that slipped through.
  if (!row.wedding_slug || !row.wedding_couple || !row.wedding_type) return null;
  const project = resolveProject(row, locale);
  return {
    slug: row.wedding_slug,
    couple: row.wedding_couple,
    venue: row.wedding_venue ?? "",
    type: row.wedding_type,
    date: row.project_date,
    quote: (locale === "fr" ? row.wedding_quote_fr : row.wedding_quote_en) ?? "",
    cover: project.cover,
    photos: project.photos,
  };
}

/** All published stories, newest first. */
export async function getWeddingStories(locale: Locale): Promise<ResolvedWeddingStory[]> {
  return (await getStoryRows()).map((row) => resolveStory(row, locale)).filter((s): s is ResolvedWeddingStory => s !== null);
}

/** One story by slug, plus the next one (wrapping) for the "next story" link. */
export async function getWeddingStory(slug: string, locale: Locale) {
  const stories = await getWeddingStories(locale);
  const index = stories.findIndex((s) => s.slug === slug);
  if (index === -1) return null;
  const next = stories.length > 1 ? stories[(index + 1) % stories.length] : null;
  return { story: stories[index], next };
}
```

A wedding has at most a few dozen stories, so reading the cached list and finding one is
simpler than a second cached query per slug.

## Part F: Admin, the wedding panel

### F1. `apps/admin/src/components/admin/WeddingPanel.tsx` (client)

A presentational block. `ProjectForm` renders it **only in edit mode**, below the description
fields. It uses the form's existing `fieldClass` and `labelClass` (pass them as props, as
`TranslatableField` receives them).

| Control | Field | Behaviour |
| --- | --- | --- |
| Switch "Show as a wedding story" | `wedding_story` | When off, the fields below are visible but optional |
| Text "Couple" | `wedding_couple` | e.g. "Camille & Jonathan" |
| Text "Address" with prefix `wedding.lilispics.com/stories/` | `wedding_slug` | Auto-filled from the couple while the slug has not been edited by hand: `slugify(couple)` = NFD-normalise, strip diacritics, lowercase, non-alphanumerics → `-`, trim dashes |
| Text "Venue or city" | `wedding_venue` | |
| Select "Type" | `wedding_type` | Elopement / Intimate / Full day |
| `TranslatableField` × 2 "Couple's quote (EN/FR)" | `wedding_quote_en`, `wedding_quote_fr` | `kind` = the closest existing translation kind (read `TranslateInput` in `schemas.ts`; use the one used for descriptions) |

Show server errors next to the field they concern: `SLUG_TAKEN` on the address,
`WEDDING_INCOMPLETE` on the panel, and `MIGRATION_PENDING` as a panel-level note saying
"Wedding fields need migration 0015 (see docs/database-and-storage.md)".

### F2. `ProjectForm.tsx`

- Add the seven fields to the local `schema` and `defaultValues` (from `project`).
- On submit (edit mode), include them in the PATCH body, turning empty strings into `null`, as the existing fields do.
- Invalidate the same query keys the form already invalidates.

### F3. `AdminProjectCard.tsx`

When `project.wedding_story` is true, show a small "Wedding" label next to the existing
"Featured" label, using **the same classes** the Featured label uses. The admin is an internal tool
and keeps its own style; the wedding guardrails do not apply there.

## Part G: Environment examples

- `apps/admin/.env.example`: add `WEDDING_URL=http://localhost:3052`, commented as "Wedding site origin, for cache revalidation (runtime only)".
- `apps/wedding/.env.example`:
  - Replace the "not used by the scaffold yet" comments on the Supabase keys. They are used now.
  - Add `REVALIDATE_SECRET=`, commented as "Must equal apps/admin's value (runtime only)".
- `turbo.json` needs no change. `WEDDING_URL` and `REVALIDATE_SECRET` are runtime-only and read inside functions.

## Part H: Documentation (same change, AGENTS.md §2)

- `docs/database-and-storage.md` → `projects`: list the seven wedding columns, the three constraints and the two indexes, as the **current** schema. Add `0015` to the migration notes.
- `docs/api-reference.md`:
  - `PATCH /api/projects/[id]`: the wedding fields and the `SLUG_TAKEN`, `WEDDING_INCOMPLETE` and `MIGRATION_PENDING` errors.
  - "Which app serves what": the wedding app now serves `POST /api/revalidate`.
  - "Cache revalidation": the new tag and `WEDDING_URL`.
- `docs/admin-guide.md` → "Edit a project": how to mark a project as a wedding story.

## Part I: Verification

1. `bun run lint`, `bun run typecheck`, `bun run build` (all apps).
2. **Before-migration behaviour.** In a scratch route or with `bun -e`, you cannot reach the cache
   outside Next. Instead:
   - run `bun run dev:wedding`;
   - add a temporary log of `(await getWeddingStories("en")).length` in the dev kit page;
   - load `/kit`.

   It must print `0` with one warning and no crash. Remove the temporary log.
3. **Portfolio regression.** Run `bun run dev:web` and load `/` and `/portfolio`. They must render as
   before. Parsing must not log drift errors for the missing wedding columns.
4. **Admin.** Run `bun run dev:admin`, open a project in edit mode, and check that the wedding panel renders.
   Saving with `wedding_story` on shows `MIGRATION_PENDING` until 🧑 the operator applies 0015.
   **Do not apply it yourself.**
5. Greps and parity (no wedding app copy changed in this phase).

## Definition of done

- [ ] `0015_wedding_stories.sql` is written, idempotent, and not executed.
- [ ] Core types, schemas, parsing, cache tag, revalidation targets and `data/weddings.ts` are in place. Everything degrades to "no stories" before the migration.
- [ ] The admin can mark a project as a wedding story (edit mode), with field-level errors.
- [ ] Docs are updated. Lint, typecheck and build pass.

## Commit message

```text
Let portfolio projects become wedding stories

- Add migration 0015 with nullable wedding columns on projects (not applied)
- Add the wedding story data layer with a public cache tag and a pre-migration fallback
- Revalidate the wedding site alongside the portfolio after project changes
- Add a wedding story panel to the admin project editor
- Document the new columns, API errors and admin steps
```

🧑 **Operator, after this phase:** apply `0015_wedding_stories.sql` in the Supabase SQL editor
when convenient. Then mark one or two projects as stories so that phase 10 can be QA'd with real
data. The agent continues without waiting.
