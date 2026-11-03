import { getWeddingStories } from "@lili/core/data/weddings";
import { routing } from "@lili/core/i18n/routing";
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3052";

/** en is served at `/`, fr at `/fr` (routing.localePrefix === "as-needed"). */
function localizedPath(locale: string, path = "") {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}${path}`;
}

function alternates(path = "") {
  return {
    languages: Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedPath(locale, path)]),
    ),
  };
}

// Built but not advertised: robots.ts stays on `disallow` until launch.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await getWeddingStories(routing.defaultLocale);
  const pages: [
    string,
    MetadataRoute.Sitemap[number]["changeFrequency"],
    number,
  ][] = [
    ["", "monthly", 1],
    ["/stories", "weekly", 0.8],
    ["/rsvp", "monthly", 0.7],
    ["/privacy", "yearly", 0.2],
  ];

  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      pages.map(([path, changeFrequency, priority]) => ({
        url: localizedPath(locale, path),
        changeFrequency,
        priority,
        alternates: alternates(path),
      })),
  );

  const storyRoutes: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    stories.map((story) => ({
      url: localizedPath(locale, `/stories/${story.slug}`),
      lastModified: story.date ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: alternates(`/stories/${story.slug}`),
    })),
  );

  return [...staticRoutes, ...storyRoutes];
}
