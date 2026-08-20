# AGENTS.md — Repository Directives

This file is the canonical instruction source for AI agents working in this repository. Tool-specific files such as `CLAUDE.md` and `CODEX.md` may add narrow guidance, but they must defer to this file when instructions overlap.

## 1. Project Context

Lilis Pics is a bilingual English/French photography portfolio and self-service CMS. It includes:

- A localized public marketing site and portfolio archive.
- A protected, non-localized administration area.
- Supabase Auth, Postgres, and Storage.
- AI-assisted EN↔FR translation through OpenRouter.
- Contact-message persistence with best-effort Resend notifications.

The checked-in application, assets, translations, migrations, and documentation are the current product truth. Do not refer to or depend on the deleted `REFERENCE_PROJECT/` directory.

## 2. Read Before Changing Code

This is **Next.js 16.2.7**, not an older Next.js release. APIs, conventions, and file structure may differ from prior versions.

- Read the relevant installed guide under `node_modules/next/dist/docs/` before writing or changing Next.js code.
- Heed deprecation notices and follow the installed version rather than memory.
- Inspect the implementation and configuration before proposing architectural changes.
- Read the relevant document under `docs/` when changing a documented subsystem, then update that documentation in the same change.

## 3. Installed Stack and Commands

Use installed versions only. Do not upgrade, replace, or add dependencies without explicit approval.

- Next.js 16.2.7 with App Router and `src/proxy.ts`
- React 19.2.4 and TypeScript 5
- Tailwind CSS 4 with `@tailwindcss/postcss`
- Motion 12 via `motion/react`
- next-intl 4
- Supabase JS/SSR
- TanStack Query 5, React Hook Form, and Zod 4
- OpenRouter SDK and Resend
- QRCode for single-use rating links
- Biome 2.2.0
- Bun as package manager and script runner

Repository commands:

```powershell
bun install
bun run dev
bun run build
bun run start
bun run lint
bun run fix
bun run format
bun run typecheck
bun run seed --force
```

`bun run seed --force` is destructive: it clears project data in the configured Supabase instance. Never run it without explicit authorization and a verified target.

## 4. Architecture Boundaries

- Keep `src/components/` presentational and prop-driven. Components must not fetch data or contain server-only work.
- Fetch public data at server/page/section edges through `src/lib/data/` and pass resolved view models into components.
- Keep raw Supabase row shapes inside the data and API boundaries; use the parsing/resolution layer before rendering public UI.
- Use TanStack Query for admin-side API state and invalidation.
- Place page-level composition in `src/sections/`, static marketing data in `src/data/`, and shared types in `src/types/`.
- Keep server-only secrets and service-role access out of Client Components and browser bundles.
- Preserve the standard API envelope from `src/lib/api/response.ts` for all `/api` handlers.

## 5. Next.js, Styling, and Motion

- Use the App Router conventions documented by the installed Next.js version.
- Next.js 16 calls the request interception file `proxy.ts`; do not recreate `middleware.ts`.
- Use Tailwind utilities for component styling. Keep global CSS limited to resets, shared tokens, and behavior that cannot reasonably live in utilities.
- Use `next/font` for fonts; do not import remote fonts from CSS.
- Use `motion/react` for public-site animation and shared motion primitives from `src/lib/motion.ts` where applicable.
- Preserve performance, accessibility, reduced-motion behavior, and layout stability.

## 6. Content and Internationalization

- Public marketing copy lives in `messages/en.json` and `messages/fr.json`.
- Keep both locale files at key parity.
- English uses unprefixed routes; French uses `/fr` through next-intl's `localePrefix: "as-needed"` configuration.
- Runtime project, photo, and tag content is managed through the admin CMS and Supabase.
- Update metadata, sitemap behavior, and both languages when a public route or public copy changes.

## 7. Data, Auth, and Security

- Supabase RLS is the database security boundary. Proxy redirects are navigation/session conveniences, not authorization by themselves.
- Mutating CMS routes must remain authenticated through `withAuth` and use server-only service-role access where implemented.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `RESEND_API_KEY`, or other server secrets to client code, logs, documentation examples, or commits.
- Do not read, print, or commit `.env.local` values. Use `.env.example` for documented variable names.
- Preserve public-read/private-write policies, rating approval gates, and the private handling of visitor submissions.
- Treat migrations and storage operations as potentially destructive. Verify the target and migration order before execution.

## 8. Change Discipline and Verification

- Keep changes scoped to the requested work. Do not perform opportunistic dependency upgrades or unrelated refactors.
- Preserve user changes in a dirty worktree and never discard them without explicit approval.
- Split implementation into explicit steps. After each agreed step, summarize the result and wait for user confirmation before continuing.
- The user normally runs project commands manually in PowerShell. Provide the exact command and working-directory instruction, then wait. Only run commands yourself when the active user request explicitly authorizes that action.
- For code changes, validate proportionally with `bun run lint`, `bun run typecheck`, and `bun run build` as applicable.
- For documentation changes, also validate links, paths, commands, environment-variable names, and `git diff --check`.

## 9. Documentation Maintenance

- Keep the root `README.md` concise and useful as the project entry point.
- Keep detailed setup, architecture, data, API, admin, deployment, and troubleshooting guidance under `docs/`.
- Prefer links to the canonical detailed document instead of duplicating long instructions.
- Document the final current state of the schema; distinguish historical migration steps from active tables and constraints.
- When behavior, routes, scripts, environment variables, or operational limits change, update the relevant documentation in the same change.
