import type { Locale } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type PhotoWithTags,
  type ResolvedPhoto,
  resolvePhoto,
} from "@/types/db";

const PHOTO_SELECT = "*, tags(*)";

/** Server-side photo fetch (RLS public read). Newest first. */
async function fetchPhotos(opts: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<PhotoWithTags[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("photos")
    .select(PHOTO_SELECT)
    .order("shoot_date", { ascending: false });

  if (opts.featuredOnly) query = query.eq("featured", true);
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load photos: ${error.message}`);
  return (data ?? []) as unknown as PhotoWithTags[];
}

/** Home page — the curated featured photos (capped at 6), locale-resolved. */
export async function getFeaturedPhotos(
  locale: Locale,
  limit = 6,
): Promise<ResolvedPhoto[]> {
  const rows = await fetchPhotos({ featuredOnly: true, limit });
  return rows.map((row) => resolvePhoto(row, locale));
}

/** /portfolio — the full archive, locale-resolved. */
export async function getAllPhotos(locale: Locale): Promise<ResolvedPhoto[]> {
  const rows = await fetchPhotos({});
  return rows.map((row) => resolvePhoto(row, locale));
}
