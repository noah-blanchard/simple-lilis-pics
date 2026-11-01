import type { ComponentType } from "react";
import {
  IconArrow,
  IconCalendar,
  IconDouyin,
  IconGrid,
  IconInstagram,
  IconMail,
  IconTikTok,
} from "@/components/Icons";
import { LINK_ICON_KEYS, type LinkIconKey } from "@/lib/links/constants";

type LinkIconComponent = ComponentType<{ className?: string }>;

export interface LinkIconDefinition {
  key: LinkIconKey;
  label: string;
  Icon: LinkIconComponent;
}

const LINK_ICON_COMPONENTS: Record<LinkIconKey, LinkIconComponent> = {
  website: IconArrow,
  instagram: IconInstagram,
  tiktok: IconTikTok,
  douyin: IconDouyin,
  email: IconMail,
  portfolio: IconGrid,
  calendar: IconCalendar,
};

const LINK_ICON_LABELS: Record<LinkIconKey, string> = {
  website: "Website",
  instagram: "Instagram",
  tiktok: "TikTok",
  douyin: "Douyin",
  email: "Email",
  portfolio: "Portfolio",
  calendar: "Calendar",
};

export const LINK_ICON_REGISTRY: LinkIconDefinition[] = LINK_ICON_KEYS.map(
  (key) => ({
    key,
    label: LINK_ICON_LABELS[key],
    Icon: LINK_ICON_COMPONENTS[key],
  }),
);

export function getLinkIcon(key: LinkIconKey | null): LinkIconComponent | null {
  return key ? LINK_ICON_COMPONENTS[key] : null;
}
