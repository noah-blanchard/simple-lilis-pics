import { unstable_cache } from "next/cache";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { linkDestinationSchema } from "@/lib/api/schemas";
import { LINK_ICON_KEYS, LINK_OPEN_BEHAVIORS } from "@/lib/links/constants";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  LinkRow,
  LinksPageSettingsRow,
  ResolvedLink,
  ResolvedLinksPageSettings,
} from "@/types/db";
import { resolveImageUrl } from "@/types/db";

const publicLinkRowSchema = z.object({
  id: z.string().uuid(),
  name_en: z.string().nullable(),
  name_fr: z.string().nullable(),
  subtitle_en: z.string().nullable(),
  subtitle_fr: z.string().nullable(),
  url: linkDestinationSchema,
  icon_key: z.enum(LINK_ICON_KEYS).nullable(),
  position: z.number().int().nonnegative(),
  published: z.literal(true),
  open_behavior: z.enum(LINK_OPEN_BEHAVIORS),
  created_at: z.string(),
  updated_at: z.string(),
});

const pageSettingsRowSchema = z.object({
  id: z.literal(1),
  banner_image_path: z.string().nullable(),
  banner_focal_x: z.number().int().min(0).max(100),
  banner_focal_y: z.number().int().min(0).max(100),
  tagline_en: z.string().nullable(),
  tagline_fr: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

function parsePublishedLinks(data: unknown): LinkRow[] {
  const rows = z.array(z.unknown()).safeParse(data ?? []);
  if (!rows.success) {
    console.error("[data] links response is not an array");
    return [];
  }

  return rows.data.flatMap((row) => {
    const parsed = publicLinkRowSchema.safeParse(row);
    if (!parsed.success) {
      console.error("[data] invalid public link omitted:", parsed.error.issues);
      return [];
    }
    return [parsed.data as LinkRow];
  });
}

const getCachedLinksPageRows = unstable_cache(
  async (): Promise<{
    links: LinkRow[];
    settings: LinksPageSettingsRow;
  }> => {
    const supabase = createSupabasePublicClient();
    const [linksResult, settingsResult] = await Promise.all([
      supabase
        .from("links")
        .select("*")
        .eq("published", true)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true })
        .order("id", { ascending: true }),
      supabase.from("links_page_settings").select("*").eq("id", 1).single(),
    ]);

    if (linksResult.error)
      throw new Error(`Failed to load links: ${linksResult.error.message}`);
    if (settingsResult.error)
      throw new Error(
        `Failed to load links page settings: ${settingsResult.error.message}`,
      );
    const settings = pageSettingsRowSchema.parse(settingsResult.data);
    return {
      links: parsePublishedLinks(linksResult.data),
      settings: settings as LinksPageSettingsRow,
    };
  },
  ["public-links"],
  { tags: ["public-links"], revalidate: 300 },
);

function localizedValue(
  row: Pick<LinkRow, "name_en" | "name_fr">,
  locale: Locale,
): string {
  return locale === "fr"
    ? (row.name_fr?.trim() ?? row.name_en?.trim() ?? "")
    : (row.name_en?.trim() ?? row.name_fr?.trim() ?? "");
}

export function resolveLink(row: LinkRow, locale: Locale): ResolvedLink {
  const subtitle =
    locale === "fr"
      ? (row.subtitle_fr?.trim() ?? row.subtitle_en?.trim() ?? null)
      : (row.subtitle_en?.trim() ?? row.subtitle_fr?.trim() ?? null);

  return {
    id: row.id,
    name: localizedValue(row, locale),
    subtitle,
    url: row.url,
    iconKey: row.icon_key,
    position: row.position,
    openBehavior: row.url.startsWith("mailto:")
      ? "same_tab"
      : row.open_behavior,
  };
}

export async function getPublishedLinks(
  locale: Locale,
): Promise<ResolvedLink[]> {
  const { links } = await getCachedLinksPageRows();
  return links.map((row) => resolveLink(row, locale));
}

export async function getPublicLinksPage(locale: Locale): Promise<{
  links: ResolvedLink[];
  settings: ResolvedLinksPageSettings;
}> {
  const { links, settings } = await getCachedLinksPageRows();
  const tagline =
    locale === "fr"
      ? settings.tagline_fr?.trim() || settings.tagline_en?.trim() || null
      : settings.tagline_en?.trim() || settings.tagline_fr?.trim() || null;
  return {
    links: links.map((row) => resolveLink(row, locale)),
    settings: {
      bannerImageUrl: settings.banner_image_path
        ? resolveImageUrl(settings.banner_image_path)
        : null,
      bannerFocalX: settings.banner_focal_x,
      bannerFocalY: settings.banner_focal_y,
      tagline,
    },
  };
}
