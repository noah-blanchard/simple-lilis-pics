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
export const portfolioHref = (locale: string) =>
  locale === "fr" ? "https://lilispics.com/fr" : "https://lilispics.com";

export const INSTAGRAM_HREF = "https://www.instagram.com/itslilis.pics";
