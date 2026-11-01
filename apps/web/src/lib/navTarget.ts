import type { NavItem } from "@/data/nav";

// Nav anchor items (e.g. `#about`) only resolve on the homepage, since that's
// the only page those section ids exist on. Shared by every place that renders
// `navItems` (the Hero rail, the fullscreen overlay, the Footer sitemap) so a
// click from any other route (e.g. a portfolio detail page) becomes a real
// navigation to `/#id` instead of silently doing nothing.

/** True when this item should smooth-scroll in place rather than navigate. */
export const isInPageAnchor = (item: NavItem, isHome: boolean) =>
  item.type === "anchor" && isHome;

/** The href to navigate to for route items, and for anchor items when not
 *  already on the homepage. */
export const resolveNavHref = (item: NavItem, isHome: boolean) => {
  if (item.type === "route") return item.target;
  return isHome ? item.target : `/${item.target}`;
};

/** Smooth-scrolls to an in-page anchor. `onNavigate` (e.g. closing a hosting
 *  overlay) runs first, with a short delay before scrolling so its exit
 *  animation has a beat to start; omit it for purely inline use. */
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
