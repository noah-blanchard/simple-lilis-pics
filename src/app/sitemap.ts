import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/data/projects";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects(routing.defaultLocale);

  const staticRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) => [
      {
        url: localizedPath(locale),
        changeFrequency: "monthly",
        priority: 1,
        alternates: alternates(),
      },
      {
        url: localizedPath(locale, "/portfolio"),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: alternates("/portfolio"),
      },
    ],
  );

  const projectRoutes: MetadataRoute.Sitemap = routing.locales.flatMap(
    (locale) =>
      projects.map((project) => ({
        url: localizedPath(locale, `/portfolio/${project.id}`),
        lastModified: project.date ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
        alternates: alternates(`/portfolio/${project.id}`),
      })),
  );

  return [...staticRoutes, ...projectRoutes];
}
