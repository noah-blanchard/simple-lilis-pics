export const LINK_ICON_KEYS = [
  "website",
  "instagram",
  "tiktok",
  "douyin",
  "email",
  "portfolio",
  "calendar",
] as const;

export type LinkIconKey = (typeof LINK_ICON_KEYS)[number];

export const LINK_OPEN_BEHAVIORS = ["same_tab", "new_tab"] as const;

export type LinkOpenBehavior = (typeof LINK_OPEN_BEHAVIORS)[number];
