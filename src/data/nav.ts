// Primary navigation items for the fullscreen menu. `anchor` items scroll to a
// section `id` on the home page; `route` items navigate (locale-aware) to a
// separate page. Labels are resolved from messages under `nav.items.{key}`.
export interface NavItem {
  key: string;
  type: "anchor" | "route";
  target: string;
}

export const navItems: NavItem[] = [
  { key: "about", type: "anchor", target: "#about" },
  { key: "portfolio", type: "route", target: "/portfolio" },
  { key: "process", type: "anchor", target: "#process" },
  { key: "pricing", type: "anchor", target: "#pricing" },
  { key: "contact", type: "anchor", target: "#contact" },
];
