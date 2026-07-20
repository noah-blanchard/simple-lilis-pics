// Social profiles for the footer / menu. Brand names aren't translated, so they
// live here as typed data (label + raw profile URL) rather than in the i18n
// message files. Links are trimmed to the bare profile URL (no share/utm query).
export interface SocialLink {
  label: string;
  href: string;
}

export const socials: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/itslilis.pics" },
  { label: "TikTok", href: "https://www.tiktok.com/@itslilis.pics" },
  { label: "Douyin (抖音)", href: "https://v.douyin.com/XQKlYarX5y4/" },
];
