@AGENTS.md

# CLAUDE - Project Guide (Authoritative Context)

This file is the single source of truth for any AI agent working on this repo. Follow it strictly. It augments the governance in AGENTS.md.

## 0) Governance and Source of Truth

- You MUST read and honor AGENTS.md before any code changes.
- This repo uses a Next.js version with breaking changes. Read the official docs at node_modules/next/dist/docs/ before writing any Next.js code.
- Never assume patterns from older Next.js versions.

## 1) Project Goal: Pixel-Perfect Clone

The goal is to reproduce the reference website perfectly. The reference project and assets are located in REFERENCE_PROJECT/.

Rules:
- Match the reference layout, typography, spacing, and visual atmosphere exactly.
- The final UI should be indistinguishable from the reference design.
- If there is any ambiguity, defer to the reference visuals over personal preference.

## 2) Tech Stack (Exact Versions)

Use the installed versions only. Do not upgrade or replace without explicit approval.

- Next.js: 16.2.7
- React: 19.2.4
- TypeScript: 5.x
- Tailwind CSS: 4.x (with @tailwindcss/postcss)
- Motion (Framer Motion successor): 12.40.0
- TanStack React Query: 5.101.0 (for future data fetching)
- Biome: 2.2.0 (lint + format)

## 3) Architecture: Ultra-Modular and Dumb Components

All visual components must be dumb/presentational.

Rules:
- No data fetching inside visual components.
- No async calls in presentational components.
- All data flows via typed props.
- Container/section components can compose data and pass it down.
- Structure the code so data can later be injected via TanStack Query without refactors.

Recommended structure (do not create unless needed by the plan):
- src/components/ for pure presentational components
- src/sections/ for page-level sections that assemble components
- src/data/ for static data objects (typed)
- src/types/ for shared TypeScript types

## 4) Styling Rules: Tailwind Only

- Use Tailwind CSS for all styling.
- Keep custom CSS minimal and only in src/app/globals.css for resets or tokens.
- Avoid arbitrary one-off styles in CSS unless absolutely necessary.
- Ensure spacing, sizing, and typography match the reference visuals exactly.

## 5) Typography and Performance

- Use next/font for all fonts (Google or local) to minimize CLS.
- Do not use @import fonts in CSS.
- Define font tokens in layout.tsx and apply via className or CSS variables.

## 6) Motion and Animations

- Use the Motion library only (motion/react syntax).
- Follow https://motion.dev/docs/react for the correct API.
- Animations must be smooth, tasteful, and performant.
- Avoid heavy animations that impact FPS or increase CLS.

## 7) Workflow: Step-by-Step Execution

Every plan must be executed in steps:
- Always split implementation into explicit steps.
- After each step, STOP and wait for user confirmation before proceeding.

Command execution policy:
- The user runs ALL commands manually in PowerShell.
- When a command is required, provide it and stop.
- Always include cd instructions if needed.
- Never run commands on behalf of the user.

## 8) Commands (Bun + Biome)

Always use Bun for package commands.

Available scripts (from package.json):
- bun run dev
- bun run build
- bun run start
- bun run lint (biome check)
- bun run format (biome format --write)

Useful one-off commands (do not run automatically):
- bun install
- bun add <package>
- bun remove <package>
- bunx biome check
- bunx biome format --write

Suggested optional scripts (only add if the user approves):
- typecheck: tsc --noEmit
- lint:fix: biome check --write
- format:check: biome format

## 9) Reference Assets and Content

- The reference project is in REFERENCE_PROJECT/.
- Use it for layout, content, and visual parity.
- If assets are needed in Next.js, copy them into public/ (user executes the command).
- Keep filenames and ratios consistent with the reference assets.

## 10) Non-Goals and Constraints

- Do not change dependencies unless explicitly asked.
- Do not refactor beyond what is required for the current step.
- Do not introduce new CSS frameworks or animation libraries.

## 11) Output Expectations

- Components are clean, typed, and modular.
- The UI matches the reference pixel-for-pixel.
- The codebase stays aligned with AGENTS.md and this CLAUDE guide.
