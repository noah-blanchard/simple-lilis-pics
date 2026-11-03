import type { NavItem } from "@/data/nav";

// Adapted from apps/web/src/lib/navTarget.ts. Anchor items only resolve on the
// home page; from any other page they become a real navigation to `/#id`.
// External items never go through these helpers.

/** True when this item should smooth-scroll in place rather than navigate. */
export const isInPageAnchor = (item: NavItem, isHome: boolean) =>
  item.type === "anchor" && isHome;

/** The href to navigate to for route items, and for anchor items when not
 *  already on the home page. */
export const resolveNavHref = (item: NavItem, isHome: boolean) => {
  if (item.type === "route") return item.target;
  return isHome ? item.target : `/${item.target}`;
};

/** Smooth-scrolls to an in-page anchor. `onNavigate` (e.g. closing the menu)
 *  runs first, with a short delay so its exit animation has a beat to start. */
export const smoothScrollToAnchor = (
  target: string,
  onNavigate?: () => void,
) => {
  onNavigate?.();
  const id = target.slice(1);
  window.setTimeout(
    () => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    onNavigate ? 60 : 0,
  );
};
