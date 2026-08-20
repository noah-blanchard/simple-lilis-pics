import type { Locale } from "@/i18n/routing";
import { PHOTOS_BUCKET, SUPABASE_URL } from "@/lib/env";
import type { LinkIconKey, LinkOpenBehavior } from "@/lib/links/constants";

/* ── Shared ── */

export interface TagRow {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  /** When the admin first opened it; null while unread. */
  read_at: string | null;
}

/** One QR/NFC code Lili generates in the field. Single-use + short-lived. */
export interface RatingTokenRow {
  id: string;
  token: string;
  locale: Locale;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export interface RatingRow {
  id: string;
  token_id: string | null;
  stars: number;
  note: string | null;
  name: string | null;
  locale: Locale;
  approved: boolean;
  created_at: string;
}

export interface LinkRow {
  id: string;
  name_en: string | null;
  name_fr: string | null;
  subtitle_en: string | null;
  subtitle_fr: string | null;
  url: string;
  icon_key: LinkIconKey | null;
  position: number;
  published: boolean;
  open_behavior: LinkOpenBehavior;
  created_at: string;
  updated_at: string;
}

export interface LinkClickStat {
  link_id: string;
  total: number;
  current_period: number;
  previous_period: number;
  last_clicked_at: string | null;
}

export interface AdminLinksSnapshot {
  links: LinkRow[];
  stats: LinkClickStat[];
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
  featured_order: number | null; // manual position among featured projects
  featured_col_span: number; // 1..8 base columns — tile width in the featured bento grid
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
  featuredColSpan: number; // 1..8 base columns — tile width in the featured bento grid
  tags: string; // comma-joined locale labels
  cover: ResolvedProjectPhoto | null; // chosen cover, or first photo, or null
  photos: ResolvedProjectPhoto[]; // ordered by position
}

/** A rating as the public testimonials render it. `name` stays nullable so the
 *  component can substitute its own localized "Anonymous" label rather than
 *  this mapper needing a translator. */
export interface ResolvedRating {
  id: string;
  stars: number;
  note: string;
  name: string | null;
  /** 1–2 uppercase letters for the monogram avatar; null when anonymous. */
  initials: string | null;
  date: string; // ISO timestamp
}

export interface ResolvedLink {
  id: string;
  name: string;
  subtitle: string | null;
  url: string;
  iconKey: LinkIconKey | null;
  position: number;
  openBehavior: LinkOpenBehavior;
}

export function resolveRating(row: RatingRow): ResolvedRating {
  const name = row.name?.trim() || null;

  const initials =
    name
      ?.split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || null;

  return {
    id: row.id,
    stars: row.stars,
    note: row.note ?? "",
    name,
    initials,
    date: row.created_at,
  };
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
    featuredColSpan: row.featured_col_span ?? 2,
    tags: tagLabels.join(", "),
    cover,
    photos,
  };
}
