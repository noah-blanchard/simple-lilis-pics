import { unstable_cache } from "next/cache";
import { z } from "zod";
import type { Locale } from "@/i18n/routing";
import { linkDestinationSchema } from "@/lib/api/schemas";
import { LINK_ICON_KEYS, LINK_OPEN_BEHAVIORS } from "@/lib/links/constants";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type { LinkRow, ResolvedLink } from "@/types/db";

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

const getCachedPublishedLinkRows = unstable_cache(
  async (): Promise<LinkRow[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("links")
      .select("*")
      .eq("published", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true });

    if (error) throw new Error(`Failed to load links: ${error.message}`);
    return parsePublishedLinks(data);
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
  const rows = await getCachedPublishedLinkRows();
  return rows.map((row) => resolveLink(row, locale));
}
