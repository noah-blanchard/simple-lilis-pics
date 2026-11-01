import { z } from "zod";
import type { ProjectWithRelations } from "@/types/db";

/** Shared PostgREST select. Two FKs exist between projects↔project_photos
 *  (project_id + cover_photo_id), so the `!project_id` hint disambiguates. */
export const PROJECT_SELECT =
  "*, project_photos!project_id(*), project_tags(tags(*))";

const tagRow = z.object({
  id: z.string(),
  slug: z.string(),
  label_fr: z.string(),
  label_en: z.string(),
  created_at: z.string(),
});

const projectPhotoRow = z.object({
  id: z.string(),
  project_id: z.string(),
  image_path: z.string(),
  orientation: z.enum(["landscape", "portrait"]),
  position: z.number(),
  created_at: z.string(),
});

// Mirrors `ProjectWithRelations`. Unknown columns from `select *` are stripped
// (not rejected), so adding a DB column never breaks parsing.
const projectWithRelations = z.object({
  id: z.string(),
  title_fr: z.string().nullable(),
  title_en: z.string().nullable(),
  description_fr: z.string().nullable(),
  description_en: z.string().nullable(),
  project_date: z.string().nullable(),
  featured: z.boolean(),
  featured_order: z.number().nullable(),
  featured_col_span: z.number().default(2),
  cover_photo_id: z.string().nullable(),
  created_at: z.string(),
  project_photos: z.array(projectPhotoRow),
  project_tags: z.array(z.object({ tags: tagRow })),
});

/** Validate the Supabase response shape at the data-layer boundary. On drift we
 *  log the zod issues and fall back to the raw rows, so a schema mismatch is
 *  surfaced in logs without taking the (public) portfolio pages down. */
export function parseProjects(data: unknown): ProjectWithRelations[] {
  const result = z.array(projectWithRelations).safeParse(data ?? []);
  if (!result.success) {
    console.error("[data] project shape drift:", result.error.issues);
    return (data ?? []) as unknown as ProjectWithRelations[];
  }
  return result.data as ProjectWithRelations[];
}

export function parseProject(data: unknown): ProjectWithRelations {
  const result = projectWithRelations.safeParse(data);
  if (!result.success) {
    console.error("[data] project shape drift:", result.error.issues);
    return data as unknown as ProjectWithRelations;
  }
  return result.data as ProjectWithRelations;
}
