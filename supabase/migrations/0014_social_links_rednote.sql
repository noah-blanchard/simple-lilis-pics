-- Adds Rednote (Xiaohongshu / 小红书) to the allowed links-page social icons.

alter table public.social_links
  drop constraint if exists social_links_icon_key_check;

alter table public.social_links
  add constraint social_links_icon_key_check check (icon_key in (
    'instagram', 'tiktok', 'facebook', 'x', 'threads', 'bluesky',
    'youtube', 'vimeo', 'pinterest', 'linkedin', 'snapchat',
    'reddit', 'tumblr', 'mastodon', 'twitch', 'discord',
    'whatsapp', 'telegram', 'signal', 'wechat', 'rednote', 'line',
    'messenger', 'github', 'behance', 'dribbble', 'flickr',
    '500px', 'spotify', 'soundcloud', 'bandcamp', 'patreon',
    'ko-fi', 'substack', 'medium', 'website', 'email'
  ));
