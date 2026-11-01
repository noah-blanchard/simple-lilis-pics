# Phase 03: Route-handler logic into `@lili/core/handlers`

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Move the body of every API route file into `packages/core/src/handlers/*.ts`
as **named** handler functions. Each `apps/web/src/app/api/**/route.ts` becomes
a thin shim that assigns those functions to the HTTP method exports.

After this phase, any app can mount any endpoint with a 3-line file. That is
what lets phase 05 split public and admin routes between `apps/web` and
`apps/admin` without duplicating logic.

Runtime behavior, URLs, status codes, envelopes and auth stay **identical**.
The `revalidateTag("public-links", { expire: 0 })` call in the links handler
stays as it is in this phase. Phase 05 replaces it.

## Preconditions

- [ ] Phase 02 is committed, and build passes from the root.
- [ ] Branch `refactor/monorepo`, clean tree, `master` not ahead (README §8).

## Out of scope

- Changing any handler logic, validation, status code or message.
- Moving routes between apps (phase 05).
- Adding new endpoints.

---

## Step 1: Read the Next.js route handler docs

Per AGENTS.md, read
`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`
(or the closest file under `01-app/03-api-reference/03-file-conventions/` that
documents `route.ts`). Note that HTTP method exports are read from the module's
exports at runtime, while segment config (`runtime`, `dynamic`, `maxDuration`,
…) is statically analyzed. That is why golden rule 6 keeps segment config in the
app file. None exists today.

## Step 2: Mapping table (authoritative)

All paths: route files are under `apps/web/src/app/api/`, handler files under
`packages/core/src/handlers/`.

| Route file | Handler file | Old export → new handler name | Auth (unchanged) |
| --- | --- | --- | --- |
| `contact/route.ts` | `contact.ts` | `GET` → `listContactMessages` · `POST` → `submitContactMessage` | GET auth · POST public |
| `contact/[id]/route.ts` | `contact-by-id.ts` | `PATCH` → `updateContactMessage` · `DELETE` → `deleteContactMessage` | auth |
| `links/route.ts` | `links.ts` | `GET` → `getLinksEditorSnapshot` · `PUT` → `saveLinksEditorSnapshot` | auth |
| `links/[id]/click/route.ts` | `link-click.ts` | `POST` → `recordLinkClick` | public (same-origin) |
| `links/socials/[id]/click/route.ts` | `social-link-click.ts` | `POST` → `recordSocialLinkClick` | public (same-origin) |
| `projects/route.ts` | `projects.ts` | `GET` → `listProjects` · `POST` → `createProject` | GET none · POST auth |
| `projects/reorder/route.ts` | `projects-reorder.ts` | `PATCH` → `reorderProjects` | auth |
| `projects/[id]/route.ts` | `project-by-id.ts` | `PATCH` → `updateProject` · `DELETE` → `deleteProject` | auth |
| `projects/[id]/photos/route.ts` | `project-photos.ts` | `POST` → `uploadProjectPhotos` | auth |
| `rating-tokens/route.ts` | `rating-tokens.ts` | `POST` → `createRatingToken` | auth |
| `ratings/route.ts` | `ratings.ts` | `POST` → `submitRating` · `GET` → `listRatings` | POST public · GET auth |
| `ratings/[id]/route.ts` | `rating-by-id.ts` | `PATCH` → `updateRating` · `DELETE` → `deleteRating` | auth |
| `tags/route.ts` | `tags.ts` | `GET` → `listTags` · `POST` → `createTag` | GET none · POST auth |
| `tags/[id]/route.ts` | `tag-by-id.ts` | `PATCH` → `updateTagById` · `DELETE` → `deleteTagById` | auth |
| `translate/route.ts` | `translate.ts` | `POST` → `translateFields` | auth |

If a new name collides with an identifier that already exists in the file,
append `Handler` to the new name (e.g. `createProjectHandler`) and note it in
the report. None is expected.

## Step 3: Move each route file to its handler file (`git mv`)

```bash
mkdir -p packages/core/src/handlers
cd apps/web/src/app/api
git mv contact/route.ts                 ../../../../../packages/core/src/handlers/contact.ts
git mv "contact/[id]/route.ts"          ../../../../../packages/core/src/handlers/contact-by-id.ts
git mv links/route.ts                   ../../../../../packages/core/src/handlers/links.ts
git mv "links/[id]/click/route.ts"      ../../../../../packages/core/src/handlers/link-click.ts
git mv "links/socials/[id]/click/route.ts" ../../../../../packages/core/src/handlers/social-link-click.ts
git mv projects/route.ts                ../../../../../packages/core/src/handlers/projects.ts
git mv projects/reorder/route.ts        ../../../../../packages/core/src/handlers/projects-reorder.ts
git mv "projects/[id]/route.ts"         ../../../../../packages/core/src/handlers/project-by-id.ts
git mv "projects/[id]/photos/route.ts"  ../../../../../packages/core/src/handlers/project-photos.ts
git mv rating-tokens/route.ts           ../../../../../packages/core/src/handlers/rating-tokens.ts
git mv ratings/route.ts                 ../../../../../packages/core/src/handlers/ratings.ts
git mv "ratings/[id]/route.ts"          ../../../../../packages/core/src/handlers/rating-by-id.ts
git mv tags/route.ts                    ../../../../../packages/core/src/handlers/tags.ts
git mv "tags/[id]/route.ts"             ../../../../../packages/core/src/handlers/tag-by-id.ts
git mv translate/route.ts               ../../../../../packages/core/src/handlers/translate.ts
cd -
```

(`apps/web/src/app/api` is 5 levels below the repo root, hence `../../../../../`.
If your shell's working directory differs, use repo-root-relative paths
instead. The target names must match the table.)

The directories under `apps/web/src/app/api/` are now empty or contain only
empty subfolders. That's fine: step 5 recreates the route files in the same
folders.

## Step 4: Edit each handler file

For every file in `packages/core/src/handlers/`:

1. **Rename the method exports** per the table:
   - `export const GET = withAuth(async () => {` →
     `export const listContactMessages = withAuth(async () => {`
   - `export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {` →
     `export const updateContactMessage = withAuth<Ctx>(async ({ request, ctx }) => {`
   - `export async function POST(request: Request) {` →
     `export async function submitContactMessage(request: Request) {`
   - `export async function POST(request: Request, { params }: Ctx) {` →
     `export async function recordLinkClick(request: Request, { params }: Ctx) {`
   - `export async function GET() {` → `export async function listTags() {`
     (and the same pattern for the other functions).
2. **Rewrite imports to relative paths.** Handler files live in
   `packages/core/src/handlers/`, so:

   | Old specifier | New specifier |
   | --- | --- |
   | `@lili/core/api/response` | `../api/response` |
   | `@lili/core/api/schemas` | `../api/schemas` |
   | `@lili/core/api/validate` | `../api/validate` |
   | `@lili/core/api/with-auth` | `../api/with-auth` |
   | `@lili/core/data/parse` | `../data/parse` |
   | `@lili/core/env` | `../env` |
   | `@lili/core/mail/resend` | `../mail/resend` |
   | `@lili/core/rating` | `../rating` |
   | `@lili/core/slugify` | `../slugify` |
   | `@lili/core/supabase/admin` | `../supabase/admin` |
   | `@lili/core/supabase/server` | `../supabase/server` |
   | `@lili/core/translate/openrouter` | `../translate/openrouter` |
   | `@lili/core/types/db` | `../types/db` |
   | `next/cache` | `next/cache` (unchanged) |

   Bash helper, run from the repo root:

   ```bash
   sed -i -E 's#"@lili/core/([a-z/-]+)"#"../\1"#g' packages/core/src/handlers/*.ts
   ```

3. **Add `import "server-only";`** as the first line of every handler file.
   Handlers use the service-role client (or, for tags/projects `GET`, the
   same server clients). This guarantees that a client component can never
   import one by mistake. `supabase/admin.ts` already imports `server-only`,
   so this is a cheap belt-and-braces guard.
4. Update doc comments that say "GET /api/…" only if they become misleading.
   Comments that describe the URL ("`POST /api/ratings` — public") are still
   accurate and should stay.
5. Do **not** change anything else: helper functions (`readSnapshot`,
   `zUuid`, `nullIfBlank`), local `type Ctx`, error codes and messages stay
   byte-identical.

Verify:

```bash
git grep -n '"@/' -- packages/                     # empty
git grep -n '"@lili/core/' -- packages/core/       # empty (core uses relative imports)
git grep -nE '^export (const|async function) (GET|POST|PUT|PATCH|DELETE)\b' -- packages/   # empty
```

## Step 5: Create the route shims in `apps/web`

Recreate each route file at its **original path** with this exact pattern.
Imports are sorted (Biome's organizeImports runs in `bun run fix` and will
also sort them).

`apps/web/src/app/api/contact/route.ts`:

```ts
import {
  listContactMessages,
  submitContactMessage,
} from "@lili/core/handlers/contact";

export const GET = listContactMessages;
export const POST = submitContactMessage;
```

`apps/web/src/app/api/contact/[id]/route.ts`:

```ts
import {
  deleteContactMessage,
  updateContactMessage,
} from "@lili/core/handlers/contact-by-id";

export const PATCH = updateContactMessage;
export const DELETE = deleteContactMessage;
```

`apps/web/src/app/api/links/route.ts`:

```ts
import {
  getLinksEditorSnapshot,
  saveLinksEditorSnapshot,
} from "@lili/core/handlers/links";

export const GET = getLinksEditorSnapshot;
export const PUT = saveLinksEditorSnapshot;
```

`apps/web/src/app/api/links/[id]/click/route.ts`:

```ts
import { recordLinkClick } from "@lili/core/handlers/link-click";

export const POST = recordLinkClick;
```

`apps/web/src/app/api/links/socials/[id]/click/route.ts`:

```ts
import { recordSocialLinkClick } from "@lili/core/handlers/social-link-click";

export const POST = recordSocialLinkClick;
```

`apps/web/src/app/api/projects/route.ts`:

```ts
import { createProject, listProjects } from "@lili/core/handlers/projects";

export const GET = listProjects;
export const POST = createProject;
```

`apps/web/src/app/api/projects/reorder/route.ts`:

```ts
import { reorderProjects } from "@lili/core/handlers/projects-reorder";

export const PATCH = reorderProjects;
```

`apps/web/src/app/api/projects/[id]/route.ts`:

```ts
import { deleteProject, updateProject } from "@lili/core/handlers/project-by-id";

export const PATCH = updateProject;
export const DELETE = deleteProject;
```

`apps/web/src/app/api/projects/[id]/photos/route.ts`:

```ts
import { uploadProjectPhotos } from "@lili/core/handlers/project-photos";

export const POST = uploadProjectPhotos;
```

`apps/web/src/app/api/rating-tokens/route.ts`:

```ts
import { createRatingToken } from "@lili/core/handlers/rating-tokens";

export const POST = createRatingToken;
```

`apps/web/src/app/api/ratings/route.ts`:

```ts
import { listRatings, submitRating } from "@lili/core/handlers/ratings";

export const POST = submitRating;
export const GET = listRatings;
```

`apps/web/src/app/api/ratings/[id]/route.ts`:

```ts
import { deleteRating, updateRating } from "@lili/core/handlers/rating-by-id";

export const PATCH = updateRating;
export const DELETE = deleteRating;
```

`apps/web/src/app/api/tags/route.ts`:

```ts
import { createTag, listTags } from "@lili/core/handlers/tags";

export const GET = listTags;
export const POST = createTag;
```

`apps/web/src/app/api/tags/[id]/route.ts`:

```ts
import { deleteTagById, updateTagById } from "@lili/core/handlers/tag-by-id";

export const PATCH = updateTagById;
export const DELETE = deleteTagById;
```

`apps/web/src/app/api/translate/route.ts`:

```ts
import { translateFields } from "@lili/core/handlers/translate";

export const POST = translateFields;
```

Then run `bun run fix` (Biome safe fixes and import sorting) and inspect the
diff. Only the new shim files and the handler files should change.

## Step 6: Verify

```bash
bun run lint
bun run typecheck
bun run build
```

- In the build output's route table, the same 15 `/api/...` routes must appear
  as before (`ƒ` dynamic). Compare with the phase 02 build output if you
  kept it.
- Next 16 type-checks route exports against the dynamic `params` shape. A type
  error like *"Type '{ params: Promise<{ id: string }> }' is not assignable"*
  means a handler's `Ctx` doesn't match the folder's dynamic segment. The
  handlers were moved verbatim, so this should not happen. If it does,
  report rather than loosen types.

Dev smoke test (`bun run dev:web`), read-only:

```bash
curl -s http://localhost:3050/api/tags                    # {"ok":true,"data":[...]}
curl -s http://localhost:3050/api/contact                 # {"ok":false,"error":{"code":"UNAUTHORIZED",...}} 401
curl -s -X POST http://localhost:3050/api/ratings -H "content-type: application/json" -d "{}"   # 422 VALIDATION_ERROR
curl -s -X POST http://localhost:3050/api/links/00000000-0000-4000-8000-000000000000/click     # 403 FORBIDDEN (no Origin)
```

🧑 Operator, logged in: open `/admin/projects` (list loads) and `/admin/links`
(editor loads). Optionally make one **reversible** edit, e.g. toggle and
restore a link's published state, to exercise `PUT /api/links` and its
`revalidateTag`.

## Step 7: Commit

```text
Move API route logic into @lili/core handlers

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

`git show --stat HEAD` should show 15 renames
(`apps/web/src/app/api/... => packages/core/src/handlers/...`) plus 15 new
shim files.

---

## Definition of done

- [ ] 15 handler files in `packages/core/src/handlers/` with named exports
      and relative imports, each starting with `import "server-only";`.
- [ ] 15 route shims in `apps/web/src/app/api/` at the original paths.
- [ ] No `GET/POST/...` exports inside `packages/`.
- [ ] Lint, typecheck and build pass, and the curl checks match.
- [ ] Commit made. Phase report delivered. STOP.
