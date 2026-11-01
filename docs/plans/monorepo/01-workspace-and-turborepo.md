# Phase 01: Workspace layout, Bun workspaces, Turborepo

> Read `README.md` in this folder first. This phase assumes its golden rules.

## Goal

Move the existing app, unchanged, into `apps/web`. Turn the repo root into a
private Bun workspace driven by Turborepo. **Behavior must be identical**: same
URLs, same port (3050), same build output. No source file under `src/`
changes in this phase.

## Preconditions

- [ ] Current branch is `refactor/monorepo` (`git branch --show-current`).
- [ ] Working tree is clean (`git status --porcelain` prints nothing besides
      the plans if they are still uncommitted).
- [ ] `git log --oneline refactor/monorepo..master` prints nothing (otherwise
      STOP, see README §8).
- [ ] `bun --version` prints `1.3.13`. If it prints something else, note it in
      the report and use that version in `packageManager` below.

## Out of scope

- Any change inside `src/`, `messages/`, `public/` (moves only).
- Creating packages (phase 02+).
- Docker or Dokploy.

---

## Step 1: Snapshot dependency versions

```powershell
bun pm ls --all > "$env:TEMP\lili-deps-before.txt"
```

(See README §7.3. If `--all` is unsupported, use `bun pm ls`.)

## Step 2: 🧑 Operator moves the local env file

The agent must not read or move `.env.local`. Ask the operator to run, from
the repo root:

```powershell
New-Item -ItemType Directory -Force apps\web | Out-Null
Move-Item .env.local apps\web\.env.local
```

Wait for confirmation before continuing. (If the operator prefers, they can
do this after step 3. It only needs to be done before step 9.)

## Step 3: Move the app with `git mv`

From the repo root (Bash syntax shown; PowerShell works the same for `git mv`):

```bash
mkdir -p apps/web
git mv src apps/web/src
git mv public apps/web/public
git mv messages apps/web/messages
git mv scripts apps/web/scripts
git mv next.config.ts apps/web/next.config.ts
git mv postcss.config.mjs apps/web/postcss.config.mjs
git mv tsconfig.json apps/web/tsconfig.json
git mv package.json apps/web/package.json
git mv .env.example apps/web/.env.example
```

These stay at the root: `biome.json`, `bun.lock`, `.gitignore`, `AGENTS.md`,
`CLAUDE.md`, `CODEX.md`, `README.md`, `docs/`, `supabase/`.

Then delete the root build artifacts. They are untracked and get regenerated:

```bash
rm -rf .next tsconfig.tsbuildinfo next-env.d.ts
```

Do **not** delete root `node_modules`. Bun reuses and relinks it.

## Step 4: Edit `apps/web/package.json`

Starting from the moved file, make exactly these changes:

1. `"name": "lili-simple-portfolio"` → `"name": "@lili/web"`.
2. Scripts: keep `dev`, `build`, `start`, `typecheck`, `seed` exactly as they
   are. **Remove** `lint`, `format`, `fix`, `fix:unsafe` (Biome now runs once
   at the root).
3. Remove `"@biomejs/biome"` from `devDependencies` (it moves to the root).
4. Remove the `ignoreScripts` and `trustedDependencies` blocks (they move to the
   root, where Bun reads them).
5. Leave every other dependency and version range untouched.

Expected result:

```json
{
  "name": "@lili/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3050",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "seed": "bun run scripts/seed.ts"
  },
  "dependencies": { "...": "unchanged" },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

## Step 5: Create the root `package.json`

```json
{
  "name": "lilis-pics",
  "private": true,
  "packageManager": "bun@1.3.13",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "turbo run dev --filter=@lili/web",
    "build": "turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "biome check",
    "format": "biome format --write",
    "fix": "biome check --write",
    "fix:unsafe": "biome check --write --unsafe"
  },
  "devDependencies": {
    "@biomejs/biome": "2.2.0"
  },
  "ignoreScripts": ["sharp", "unrs-resolver"],
  "trustedDependencies": ["sharp", "unrs-resolver"]
}
```

`packages/` does not exist yet. An empty workspace glob is fine.

## Step 6: Add Turborepo (approved dependency)

From the repo root:

```bash
bun add -d -E turbo@2
```

This pins the exact 2.x version that gets resolved. Record that version in
the phase report.

## Step 7: Create `turbo.json` at the root

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"],
      "env": ["NEXT_PUBLIC_*", "ADMIN_URL"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "start": {
      "cache": false,
      "persistent": true
    }
  }
}
```

Notes for the agent:

- Turborepo 2 runs tasks in **strict env mode**. Next.js reads `.env.local`
  from disk itself, so local builds still see their variables. Dockerfiles
  (phase 06) call `next build` directly, not through Turbo, so strict mode
  never hides build args.
- `ADMIN_URL` is declared now so the hash is right once phase 05 uses it.

## Step 8: Update `.gitignore` and `biome.json` for nested apps

`.gitignore`: several patterns are anchored to the root with a leading `/`, so
they would not match `apps/web/.next`. Replace these lines:

| Old | New |
| --- | --- |
| `/node_modules` | `node_modules` |
| `/.pnp` | `.pnp` |
| `/coverage` | `coverage` |
| `/.next/` | `.next/` |
| `/out/` | `out/` |
| `/build` | `build` |

And append:

```gitignore

# turborepo
.turbo
```

Leave every other line, including `PLAN.md`, `.env.local`, `.env` and `.vercel`,
as it is.

`biome.json`: in `files.includes`, replace the negated entries so they match at
any depth:

```json
"includes": [
  "**",
  "!**/node_modules",
  "!**/.next",
  "!**/.turbo",
  "!**/dist",
  "!**/build",
  "!REFERENCE_PROJECT"
]
```

Change nothing else in `biome.json`.

## Step 9: Install and guard the lockfile

```bash
bun install
```

Then run the lockfile guard (README §7.3). Expected changes: the workspace
structure, `@lili/web`, and `turbo` (with its platform binary). Any other
version change → fix per README §7.3 or STOP.

Confirm `apps/web/node_modules` either does not exist or contains only a few
entries. Bun hoists to the root `node_modules`. Either is acceptable.

## Step 10: Verify

From the repo root:

```bash
bun run lint
bun run typecheck
bun run build
```

- `typecheck` and `build` must run the `@lili/web` task through Turbo and
  succeed.
- During `build`, check the Next.js output for a warning about **multiple
  lockfiles** or about the inferred workspace root. Next 16 infers the root
  from `bun.lock` and sets `turbopack.root`/`outputFileTracingRoot` to the
  repo root automatically. No warning is expected. If one appears, report it.
- `lint`: apply README golden rule 13 for CRLF artifacts. The moved files may
  show as CRLF working-copy artifacts. Report them; don't reformat them.

Dev smoke test (the agent may start it if authorized, or ask the operator):

```bash
bun run dev
```

Check with a browser or `curl -I`:

- `http://localhost:3050/` → 200
- `http://localhost:3050/fr` → 200
- `http://localhost:3050/portfolio` → 200
- `http://localhost:3050/links` → 200
- `http://localhost:3050/sitemap.xml` → 200
- `http://localhost:3050/admin` → 307 redirect to `/login`
- 🧑 Operator: log in at `/login`, open `/admin/projects`, confirm projects
  load. Do not change data.

Stop the dev server afterwards.

## Step 11: Minimal documentation update

Full docs rewrite is phase 09. In this phase, only keep instructions runnable:

1. `docs/local-development.md`:
   - In "Install", say `.env.local` now lives at `apps/web/.env.local`
     (copy from `apps/web/.env.example`).
   - In "Start development", the command `bun run dev` still works from the
     root and now starts all apps through Turborepo. Mention
     `bun run dev:web` for only the portfolio.
   - Where the seed script is described, say it runs from `apps/web`
     (`cd apps/web; bun run seed --force`). Keep the destructive-warning
     wording.
2. At the very top of `README.md` (below the title), add:

   ```markdown
   > **Migration in progress (branch `refactor/monorepo`).** The app now lives in
   > `apps/web`. See [`docs/plans/monorepo/`](docs/plans/monorepo/README.md).
   > Some paths below describe the pre-migration layout until phase 09.
   ```

3. At the top of `AGENTS.md` (below the title), add the same banner, with
   the link `docs/plans/monorepo/README.md`.

## Step 12: Commit

Stage everything from this phase (the moves, new root files, `bun.lock`,
config and doc edits), then commit:

```text
Move the app into apps/web behind Bun workspaces and Turborepo

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
```

Check with `git show --stat HEAD` that the moved files appear as **renames**
(`R100` or `src/... => apps/web/src/...`), not delete+add.

---

## Definition of done

- [ ] `apps/web/` contains `src`, `public`, `messages`, `scripts`,
      `next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `package.json`,
      `.env.example`.
- [ ] The root contains `package.json` (workspaces, packageManager, turbo
      scripts), `turbo.json`, `bun.lock`, `biome.json`, and the docs.
- [ ] `bun run lint`, `bun run typecheck` and `bun run build` pass from the root
      (CRLF artifacts excepted and listed).
- [ ] The dev smoke test passes on port 3050.
- [ ] No third-party dependency changed version.
- [ ] One commit with renames detected.
- [ ] Phase report delivered (README §9). STOP.
