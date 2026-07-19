import { z } from "zod";

/* ── Tags ── */

export const tagCreateSchema = z.object({
  label_fr: z.string().min(1, "label_fr is required"),
  label_en: z.string().min(1, "label_en is required"),
});

export const tagUpdateSchema = tagCreateSchema.partial();

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;

/* ── AI translation ── */

/** Payload for POST /api/translate — translate `text` from one language to the
 *  other. `kind` lets the prompt adapt (short title vs longer description). */
export const translateSchema = z
  .object({
    text: z.string().trim().min(1).max(2000),
    from: z.enum(["en", "fr"]),
    to: z.enum(["en", "fr"]),
    kind: z.enum(["title", "description", "tag"]),
  })
  .refine((v) => v.from !== v.to, { message: "from and to must differ" });

export type TranslateInput = z.infer<typeof translateSchema>;

/* ── File upload constraints ── */

export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

/* ── Projects ── */

export const ORIENTATIONS = ["landscape", "portrait"] as const;
export const MAX_PROJECT_PHOTOS = 4;
export const MAX_FEATURED_PROJECTS = 6;

/** Per-photo metadata sent alongside each uploaded file. */
export const projectPhotoMetaSchema = z.object({
  orientation: z.enum(ORIENTATIONS),
  position: z
    .number()
    .int()
    .min(0)
    .max(MAX_PROJECT_PHOTOS - 1),
});

/** Project creation — all text fields optional, featured defaults false. */
export const projectCreateSchema = z.object({
  title_fr: z.string().nullable().optional(),
  title_en: z.string().nullable().optional(),
  description_fr: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  project_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "project_date must be YYYY-MM-DD")
    .nullable()
    .optional(),
  featured: z.boolean().default(false),
  tag_ids: z.array(z.string().uuid()).default([]),
  /** Index into the uploaded files array that becomes the cover (default 0). */
  cover_index: z
    .number()
    .int()
    .min(0)
    .max(MAX_PROJECT_PHOTOS - 1)
    .default(0),
});

/** Project update — all fields optional; photos[] allows reorder/orientation edits. */
export const projectUpdateSchema = z.object({
  title_fr: z.string().nullable().optional(),
  title_en: z.string().nullable().optional(),
  description_fr: z.string().nullable().optional(),
  description_en: z.string().nullable().optional(),
  project_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .optional(),
  featured: z.boolean().optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
  cover_photo_id: z.string().uuid().optional(),
  photos: z
    .array(
      z.object({
        id: z.string().uuid(),
        position: z
          .number()
          .int()
          .min(0)
          .max(MAX_PROJECT_PHOTOS - 1),
        orientation: z.enum(ORIENTATIONS),
      }),
    )
    .optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
