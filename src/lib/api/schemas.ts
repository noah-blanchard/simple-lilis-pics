import { z } from "zod";

/* ── Photos ── */

/** Metadata accompanying an upload (the file is validated separately). */
export const photoCreateSchema = z.object({
  title_fr: z.string().min(1, "title_fr is required"),
  title_en: z.string().min(1, "title_en is required"),
  shoot_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "shoot_date must be YYYY-MM-DD"),
  featured: z.boolean(),
  tag_ids: z.array(z.string().uuid()).default([]),
});

/** Edit: every field optional. */
export const photoUpdateSchema = photoCreateSchema.partial();

export type PhotoCreateInput = z.infer<typeof photoCreateSchema>;
export type PhotoUpdateInput = z.infer<typeof photoUpdateSchema>;

/* ── Tags ── */

export const tagCreateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits or dashes"),
  label_fr: z.string().min(1, "label_fr is required"),
  label_en: z.string().min(1, "label_en is required"),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;

/* ── File upload constraints (the ≤5MB target is also enforced client-side
 *     by compression before sending). ── */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;
