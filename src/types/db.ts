import type { Locale } from "@/i18n/routing";
import { PHOTOS_BUCKET, SUPABASE_URL } from "@/lib/env";

/* ── Shared ── */

export interface TagRow {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
  created_at: string;
}

export type Orientation = "landscape" | "portrait";

/** Build the public URL of a stored image. Legacy rows already hold a full
 *  URL (e.g. Unsplash) — return those as-is. */
export function resolveImageUrl(imagePath: string): string {
  if (/^https?:\/\//.test(imagePath)) return imagePath;
  return `${SUPABASE_URL}/storage/v1/object/public/${PHOTOS_BUCKET}/${imagePath}`;
}

/* ── Raw DB rows (snake_case, mirrors SQL schema) ── */

export interface ProjectPhotoRow {
  id: string;
  project_id: string;
  image_path: string;
  orientation: Orientation;
  position: number;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  title_fr: string | null;
  title_en: string | null;
  description_fr: string | null;
  description_en: string | null;
  project_date: string | null; // "YYYY-MM-DD" | null
  featured: boolean;
  cover_photo_id: string | null;
  created_at: string;
}

/** Shape returned by the Supabase select:
 *  "*, project_photos(*), project_tags(tags(*))" */
export interface ProjectWithRelations extends ProjectRow {
  project_photos: ProjectPhotoRow[];
  project_tags: { tags: TagRow }[];
}

/* ── Resolved shapes consumed by presentational components ── */

export interface ResolvedProjectPhoto {
  id: string;
  img: string;
  orientation: Orientation;
  position: number;
}

export interface ResolvedProject {
  id: string;
  title: string; // locale-specific; "" when null
  description: string; // locale-specific; "" when null
  year: string; // derived from project_date; "" when null
  date: string | null; // ISO date or null
  featured: boolean;
  tags: string; // comma-joined locale labels
  cover: ResolvedProjectPhoto | null; // chosen cover, or first photo, or null
  photos: ResolvedProjectPhoto[]; // ordered by position
}

export function resolveProject(
  row: ProjectWithRelations,
  locale: Locale,
): ResolvedProject {
  const photos: ResolvedProjectPhoto[] = [...row.project_photos]
    .sort((a, b) => a.position - b.position)
    .map((p) => ({
      id: p.id,
      img: resolveImageUrl(p.image_path),
      orientation: p.orientation,
      position: p.position,
    }));

  const cover =
    photos.find((p) => p.id === row.cover_photo_id) ?? photos[0] ?? null;

  const tagLabels = row.project_tags.map((pt) =>
    locale === "fr" ? pt.tags.label_fr : pt.tags.label_en,
  );

  return {
    id: row.id,
    title: (locale === "fr" ? row.title_fr : row.title_en) ?? "",
    description:
      (locale === "fr" ? row.description_fr : row.description_en) ?? "",
    year: row.project_date?.slice(0, 4) ?? "",
    date: row.project_date,
    featured: row.featured,
    tags: tagLabels.join(", "),
    cover,
    photos,
  };
}
