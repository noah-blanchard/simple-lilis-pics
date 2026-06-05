// Single source of truth for top-bar control sizing. Every nav control — the
// locale switcher, theme toggle, back links, close button, sign-out — lines up
// at the same 36px (h-9) height so the cluster reads as one row. The locale and
// theme switchers are the reference size; everything else matches them.

const base =
  "inline-flex h-9 items-center justify-center rounded-full border border-line text-fg/80 transition-colors hover:bg-inverse hover:text-on-inverse";

/** Text pill (e.g. "← Back to site"). */
export const navTextControl = `${base} gap-2 px-4 text-[13px] font-medium`;

/** Square icon button (e.g. the gallery close button). */
export const navIconControl = `${base} w-9`;
