# Phase 06: Shell

> Read [`README.md`](README.md) first. This phase assumes its golden rules.

## Goal

Give every wedding page the same frame as lilispics.com:

- a logo row at the top;
- the floating `Menu` pill once that row scrolls away;
- the full-screen circle-wipe menu;
- a night footer.

The scaffold placeholder page is replaced with a minimal home that passes the guardrails.

**Out of scope:** the home sections (phases 07–08) and the routes other than `/`.

## Preconditions

- [ ] Phase 05 is committed.
- [ ] The dev kit page renders.

## Read first

- [`02-design-decisions.md`](02-design-decisions.md) D2, D3, §5, §6 (first and last rows)
- `apps/web/src/components/{Logo,LocaleSwitcher,MenuIcon,MenuToggle,HoverLink,FloatingMenuButton,MenuOverlay,NavIndexList}.tsx`
- `apps/web/src/lib/navTarget.ts`, `apps/web/src/data/nav.ts`, `apps/web/src/sections/Footer.tsx`
- `apps/wedding/src/app/[locale]/layout.tsx`, `apps/wedding/src/i18n/navigation.ts`
- [`04-copy-deck.md`](04-copy-deck.md): the `nav`, `footer` and `meta` namespaces

---

## Part A: Messages

1. In `apps/wedding/messages/{en,fr}.json`, replace `meta` and add `nav` and `footer`
   from the copy deck.
2. Keep the scaffold's `home` namespace until Part E removes its last use, then delete it
   from both files in the same step.

## Part B: Adapted copies (app-local)

These portfolio components import the portfolio's own `@/i18n/navigation` and
`@/data/*`, so they are **copied and adapted**, not shared. Keep each file's
header comment and update it to say where it came from, for example "Adapted from apps/web…".

| New file | From | Changes |
| --- | --- | --- |
| `components/MenuIcon.tsx` | `apps/web/src/components/MenuIcon.tsx` | none |
| `components/HoverLink.tsx` | `apps/web/src/components/HoverLink.tsx` | none |
| `components/MenuToggle.tsx` | `apps/web/src/components/MenuToggle.tsx` | import `PillVariant` from `@lili/ui/types` |
| `components/Logo.tsx` | `apps/web/src/components/Logo.tsx` | add an `alt` prop (callers pass `t("nav.logoAlt")`); default height `h-[clamp(3.5rem,8vw,7rem)]` (the invitation card follows, so the logo is smaller than the portfolio hero's) |
| `components/LocaleSwitcher.tsx` | `apps/web/src/components/LocaleSwitcher.tsx` | **no mono**: replace `tag-mono` with `text-[12px] font-medium tracking-[0.06em]`. Wrap in `role="group" aria-label={t("nav.localeLabel")}`. Keep the pill shape (allowed, D2) |
| `lib/navTarget.ts` | `apps/web/src/lib/navTarget.ts` | handle the new `external` type (below) |
| `components/NavList.tsx` | `apps/web/src/components/NavIndexList.tsx` | **remove the number column and the arrow** (D3). Sentence case, not uppercase: `display text-4xl sm:text-5xl md:text-6xl`. Keep the hover cross-fade fg → accent and the entrance stagger. One size only (the overlay one) |

`apps/wedding/src/data/nav.ts`:

```ts
// Primary navigation for the full-screen menu. Anchors scroll on the home page
// (and navigate to "/#id" elsewhere); routes are locale-aware; the external
// item leaves for the portfolio. Labels live under `nav.items.{key}`.
export interface NavItem {
  key: "stories" | "day" | "collections" | "questions" | "reply" | "portfolio";
  type: "anchor" | "route" | "external";
  target: string;
}

export const navItems: NavItem[] = [
  { key: "stories", type: "route", target: "/stories" },
  { key: "day", type: "anchor", target: "#the-day" },
  { key: "collections", type: "anchor", target: "#collections" },
  { key: "questions", type: "anchor", target: "#questions" },
  { key: "reply", type: "route", target: "/rsvp" },
  { key: "portfolio", type: "external", target: "https://lilispics.com" },
];

/** The portfolio in the visitor's language (French is under /fr there too). */
export const portfolioHref = (locale: string) => (locale === "fr" ? "https://lilispics.com/fr" : "https://lilispics.com");
```

The `/stories` and `/rsvp` routes are built in phases 10 and 11. Until then they 404 in dev,
which is acceptable inside this run.

## Part C: Menu state, page top, floating button, overlay

On lilispics.com only the floating button opens the menu. On the wedding site, two triggers
open it (the inline toggle in the logo row and the floating pill), so the state is lifted
into a provider.

### C1. `components/MenuProvider.tsx` (client)

```tsx
"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { MenuOverlay } from "./MenuOverlay";

interface MenuState { open: boolean; toggle: () => void; close: () => void }
const MenuContext = createContext<MenuState | null>(null);

/** One menu per page: the logo row's toggle and the floating pill both drive it. */
export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);
  return (
    <MenuContext.Provider value={value}>
      {children}
      <MenuOverlay open={open} onClose={close} />
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside MenuProvider");
  return ctx;
};
```

### C2. `components/PageTop.tsx`

- A server wrapper `<header id="page-top" className="container-site flex items-center justify-between gap-6 pt-6 md:pt-8">`.
- Left: `Logo`.
- Right: `LocaleSwitcher` and a small client `MenuToggleInline`, which calls `useMenu()` and renders `MenuToggle variant="ghost"`.
- On phones (below `sm`), hide the `LocaleSwitcher` in this row; it stays reachable in the overlay.

### C3. `components/FloatingMenuButton.tsx`

Adapted from the portfolio's version, with these changes:

- It is **not** home-only. It works on every route.
- It is visible when `#page-top` is **not** intersecting, on every breakpoint.
- It uses `useMenu()` instead of local state, and it does not render the overlay itself.
- Wrapper classes stay the same: `fixed top-6 right-6 z-[var(--z-nav)] rounded-full shadow-lg md:top-8 md:right-8`, with `MenuToggle variant="light"`.
- While the overlay is open, hide the floating pill; the overlay has its own toggle.

### C4. `components/MenuOverlay.tsx`

Adapted from the portfolio's version, with these changes:

- Same portal, Esc handling, body scroll lock, focus on the first link, and circle-wipe variants (`circle(0% at 92% 6%)` → `circle(150% at 92% 6%)`, 0.6 s `EASE`).
- **Drop** the film-strip illustration and `MenuDecor`. The middle row is only `NavList`, left-aligned.
- Meta row:
  - Instagram (`HoverLink`, `https://www.instagram.com/itslilis.pics`, `target="_blank"`);
  - the email (`mailto:`);
  - `LocaleSwitcher`.
- The overlay uses day tokens (`bg-ink`) like the portfolio's.
- `NavList` resolves items as follows:
  - `anchor` and `route`: through `navTarget.ts`;
  - `external`: `motion.a` with `href={portfolioHref(locale)}`, `target="_blank"`, `rel="noopener noreferrer"`.

## Part D: Footer

Create `apps/wedding/src/sections/Footer.tsx` as a server component, rendered as
`<Tone tone="night" as="footer" id="footer">`. Mirror the portfolio footer's three bands, with no
social pills and no mono:

1. **Closing line** (`grid lg:grid-cols-12 gap-10 items-start`):
   - `lg:col-span-7`: an `h2` with the same classes as the portfolio footer heading:
     `display text-3xl tracking-tight md:text-5xl lg:text-[56px] min-[1440px]:text-h2f-fluid`.
     It shows `titleBase` plain, then `AccentUnderline` (`text-accent italic`) on `titleAccent`.
     On night, accent means paper white (D7).
   - `lg:col-span-5 lg:flex lg:justify-end`: `PillButton variant="light"` with `t("cta")`. Its href is
     `getPathname({ href: "/rsvp", locale })` from `@/i18n/navigation`.
2. **Details** (`mt-20 grid gap-8 md:grid-cols-12`):
   - `md:col-span-4`: the availability line, in italic and `text-muted`;
   - `md:col-span-4`: the email and Instagram as `HoverLink`s, `text-[15px] text-fg/80`, stacked;
   - `md:col-span-4`: links to `lilispics.com` (`portfolioHref`, external) and Privacy (`Link` to `/privacy`, built in phase 12).
3. **Bottom bar** (`mt-16 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between`):
   - the copyright `t("copyright", { year: new Date().getFullYear() })` at `text-[14px] text-muted`;
   - `LocaleSwitcher`.

Wrap the first two bands in `Reveal`, as on lilispics.com.

## Part E: Layout and the minimal home

### E1. `apps/wedding/src/app/[locale]/layout.tsx`

Inside `NextIntlClientProvider`:

```tsx
<a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-menu)] focus:bg-sheet focus:px-4 focus:py-2">{t("skip")}</a>
<MenuProvider>
  {children}
  <FloatingMenuButton />
  <Footer />
</MenuProvider>
```

Use `getTranslations({ locale, namespace: "nav" })` for `skip`. Keep the existing
`generateMetadata` (title and description now come from the new `meta`) and keep
`robots: { index: false, follow: false }` (D20).

### E2. `apps/wedding/src/app/[locale]/page.tsx`

Replace the scaffold body with:

```tsx
<>
  <PageTop />
  <main id="main" className="container-site section-y">
    {/* Phase 07 replaces this with the invitation and the day half. */}
    <h1 className="display-xl text-center text-[clamp(40px,6vw,88px)]">{renderAccentLine(t("title"))}</h1>
  </main>
</>
```

`t` is `getTranslations({ locale, namespace: "hero" })`. Paste the `hero` namespace from the copy
deck now. Then delete the scaffold `home` namespace from both message files, and the
`PORTFOLIO_ORIGIN` constant.

## Part F: Verification

1. `bun run lint`, `bun run typecheck`, `bun run build`.
2. Guardrail greps: **zero** hits now. The scaffold's `tag-mono` and `underline` are gone.
3. EN/FR parity script.
4. Visual QA (`03-guardrails.md` §5) at 1440 and 390, EN and FR:
   - The logo row matches lilispics.com's top row in placement and weight.
   - Scrolling past the logo row makes the floating `Menu` pill fade in.
   - The menu opens with the circle wipe from both triggers.
   - In the menu: no numbers, no arrows. Esc closes it. Focus moves into it. Tab order is sane.
   - The footer sits on `#141414`, the accent line is white italic, and the night `PillButton` is a paper-white pill that wipes white on hover.
   - The skip link appears on the first Tab.
5. Record a GIF of the menu opening and closing: `wedding-menu.gif`.

## Definition of done

- [ ] Logo row, floating pill, overlay menu and night footer on every page, driven by one `MenuProvider`.
- [ ] No mono, numbers, arrows or underlines anywhere in `apps/wedding`.
- [ ] The scaffold `home` namespace is removed; `meta`, `nav`, `footer` and `hero` come from the copy deck, at parity.
- [ ] Lint, typecheck and build pass. The QA answers are in the report.

## Commit message

```text
Give the wedding site the lilispics.com frame

- Add the logo row, floating menu pill and circle-wipe menu, without numbers or arrows
- Lift menu state into a provider so both triggers share one overlay
- Add the night footer with the closing line and the reply link
- Add the skip link and replace the scaffold placeholder with a minimal home
- Paste meta, nav, footer and hero copy in English and French
```
