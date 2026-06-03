import type { Locale } from "@/i18n/routing";
import { PHOTOS_BUCKET, SUPABASE_URL } from "@/lib/env";

/* ── Raw DB rows (snake_case, mirror the SQL schema) ── */

export interface TagRow {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
  created_at: string;
}

export interface PhotoRow {
  id: string;
  title_fr: string;
  title_en: string;
  shoot_date: string; // ISO date "YYYY-MM-DD"
  image_path: string; // bucket object key, or full URL for legacy rows
  featured: boolean;
  created_at: string;
}

/** A photo row joined with its tags (shape returned by the photos queries). */
export interface PhotoWithTags extends PhotoRow {
  tags: TagRow[];
}

/* ── Resolved shape consumed by the presentational cards ──
 *  Kept compatible with the legacy `Project` prop: { id, year, img, featured,
 *  title, tags } so ProjectCard / BentoCard stay dumb and unchanged. */
export interface ResolvedPhoto {
  id: string;
  year: string;
  img: string;
  featured: boolean;
  title: string;
  tags: string; // tag labels for the locale, comma-joined (legacy format)
}

/** Build the public URL of a stored image. Legacy rows already hold a full
 *  URL (e.g. Unsplash) — return those as-is. */
export function resolveImageUrl(imagePath: string): string {
  if (/^https?:\/\//.test(imagePath)) return imagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTOS_BUCKET}/${imagePath}`;
}

/** Pick the locale-specific fields and flatten a DB row into a card-ready
 *  object. Year is derived from the shoot date (dates are locale-neutral). */
export function resolvePhoto(
  row: PhotoWithTags,
  locale: Locale,
): ResolvedPhoto {
  const labels = row.tags.map((t) =>
    locale === "fr" ? t.label_fr : t.label_en,
  );
  return {
    id: row.id,
    year: row.shoot_date.slice(0, 4),
    img: resolveImageUrl(row.image_path),
    featured: row.featured,
    title: locale === "fr" ? row.title_fr : row.title_en,
    tags: labels.join(", "),
  };
}
