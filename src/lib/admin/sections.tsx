import type { ComponentType } from "react";
import { FeaturedStat } from "@/components/admin/hub/FeaturedStat";
import { MessagesStat } from "@/components/admin/hub/MessagesStat";
import { ProjectsStat } from "@/components/admin/hub/ProjectsStat";
import { RatingsStat } from "@/components/admin/hub/RatingsStat";
import { IconGrid, IconLayout, IconMail, IconStar } from "@/components/Icons";

export interface AdminSection {
  /** Stable id — also the React key in every consumer. */
  key: string;
  href: string;
  /** Short form, for the sidebar and the mobile tab bar. */
  label: string;
  /** Page heading, shown in the mobile top bar. */
  title: string;
  /** One-line subtitle on the hub card. */
  description: string;
  Icon: ComponentType<{ className?: string }>;
  /** Shown directly in the mobile tab bar. Keep to 3 — the 4th slot is "More".
   *  Everything else is reachable from the More sheet and the hub. */
  primary?: boolean;
  /** Optional client component rendering this section's live count on its hub
   *  card. Kept as a component (not a hook or a fetch) so this module stays a
   *  static descriptor list and each stat owns its own query at the edge. */
  Stat?: ComponentType;
}

/** The admin's single source of truth: the hub grid, the desktop sidebar and
 *  the mobile bottom nav all derive from this array. Adding a section means
 *  one entry here plus one route folder — nothing else to touch. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    key: "projects",
    href: "/admin/projects",
    label: "Projects",
    title: "Projects",
    description: "Shoots, photos and tags.",
    Icon: IconGrid,
    primary: true,
    Stat: ProjectsStat,
  },
  {
    key: "featured",
    href: "/admin/featured",
    label: "Featured",
    title: "Featured layout",
    description: "Arrange the home page bento.",
    Icon: IconLayout,
    primary: true,
    Stat: FeaturedStat,
  },
  {
    key: "ratings",
    href: "/admin/ratings",
    label: "Ratings",
    title: "Ratings",
    description: "Review and publish testimonials.",
    Icon: IconStar,
    primary: true,
    Stat: RatingsStat,
  },
  {
    key: "messages",
    href: "/admin/messages",
    label: "Messages",
    title: "Messages",
    description: "Enquiries from the contact form.",
    Icon: IconMail,
    Stat: MessagesStat,
  },
];

export const ADMIN_HOME = "/admin";

/** The section owning `pathname`, by longest matching href — so /admin/projects
 *  resolves to Projects rather than also matching the hub. Returns undefined on
 *  the hub itself. */
export function findActiveSection(pathname: string): AdminSection | undefined {
  return ADMIN_SECTIONS.filter(
    (section) =>
      pathname === section.href || pathname.startsWith(`${section.href}/`),
  ).sort((a, b) => b.href.length - a.href.length)[0];
}
