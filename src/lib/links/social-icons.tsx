import type { IconType } from "react-icons";
import { FaLinkedinIn } from "react-icons/fa6";
import { FiGlobe, FiMail } from "react-icons/fi";
import {
  Si500Px,
  SiBandcamp,
  SiBehance,
  SiBluesky,
  SiDiscord,
  SiDribbble,
  SiFacebook,
  SiFlickr,
  SiGithub,
  SiInstagram,
  SiKofi,
  SiLine,
  SiMastodon,
  SiMedium,
  SiMessenger,
  SiPatreon,
  SiPinterest,
  SiReddit,
  SiSignal,
  SiSnapchat,
  SiSoundcloud,
  SiSpotify,
  SiSubstack,
  SiTelegram,
  SiThreads,
  SiTiktok,
  SiTumblr,
  SiTwitch,
  SiVimeo,
  SiWechat,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { SOCIAL_ICON_KEYS, type SocialIconKey } from "@/lib/links/constants";

export interface SocialIconDefinition {
  key: SocialIconKey;
  label: string;
  Icon: IconType;
}

const SOCIAL_ICON_COMPONENTS: Record<SocialIconKey, IconType> = {
  instagram: SiInstagram,
  tiktok: SiTiktok,
  facebook: SiFacebook,
  x: SiX,
  threads: SiThreads,
  bluesky: SiBluesky,
  youtube: SiYoutube,
  vimeo: SiVimeo,
  pinterest: SiPinterest,
  linkedin: FaLinkedinIn,
  snapchat: SiSnapchat,
  reddit: SiReddit,
  tumblr: SiTumblr,
  mastodon: SiMastodon,
  twitch: SiTwitch,
  discord: SiDiscord,
  whatsapp: SiWhatsapp,
  telegram: SiTelegram,
  signal: SiSignal,
  wechat: SiWechat,
  line: SiLine,
  messenger: SiMessenger,
  github: SiGithub,
  behance: SiBehance,
  dribbble: SiDribbble,
  flickr: SiFlickr,
  "500px": Si500Px,
  spotify: SiSpotify,
  soundcloud: SiSoundcloud,
  bandcamp: SiBandcamp,
  patreon: SiPatreon,
  "ko-fi": SiKofi,
  substack: SiSubstack,
  medium: SiMedium,
  website: FiGlobe,
  email: FiMail,
};

const SOCIAL_ICON_LABELS: Record<SocialIconKey, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X",
  threads: "Threads",
  bluesky: "Bluesky",
  youtube: "YouTube",
  vimeo: "Vimeo",
  pinterest: "Pinterest",
  linkedin: "LinkedIn",
  snapchat: "Snapchat",
  reddit: "Reddit",
  tumblr: "Tumblr",
  mastodon: "Mastodon",
  twitch: "Twitch",
  discord: "Discord",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  signal: "Signal",
  wechat: "WeChat",
  line: "LINE",
  messenger: "Messenger",
  github: "GitHub",
  behance: "Behance",
  dribbble: "Dribbble",
  flickr: "Flickr",
  "500px": "500px",
  spotify: "Spotify",
  soundcloud: "SoundCloud",
  bandcamp: "Bandcamp",
  patreon: "Patreon",
  "ko-fi": "Ko-fi",
  substack: "Substack",
  medium: "Medium",
  website: "Website",
  email: "Email",
};

export const SOCIAL_ICON_REGISTRY: SocialIconDefinition[] =
  SOCIAL_ICON_KEYS.map((key) => ({
    key,
    label: SOCIAL_ICON_LABELS[key],
    Icon: SOCIAL_ICON_COMPONENTS[key],
  }));

export function getSocialIcon(key: SocialIconKey): IconType {
  return SOCIAL_ICON_COMPONENTS[key];
}
