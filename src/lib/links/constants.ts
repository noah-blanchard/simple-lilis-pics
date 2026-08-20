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

export const SOCIAL_ICON_KEYS = [
  "instagram",
  "tiktok",
  "facebook",
  "x",
  "threads",
  "bluesky",
  "youtube",
  "vimeo",
  "pinterest",
  "linkedin",
  "snapchat",
  "reddit",
  "tumblr",
  "mastodon",
  "twitch",
  "discord",
  "whatsapp",
  "telegram",
  "signal",
  "wechat",
  "line",
  "messenger",
  "github",
  "behance",
  "dribbble",
  "flickr",
  "500px",
  "spotify",
  "soundcloud",
  "bandcamp",
  "patreon",
  "ko-fi",
  "substack",
  "medium",
  "website",
  "email",
] as const;

export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];
