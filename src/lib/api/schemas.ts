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
export const MAX_FEATURED_PROJECTS = 8;

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

/** Column span a featured tile may occupy in the bento grid (base columns). */
export const MAX_FEATURED_COL_SPAN = 8;

/** Body for PATCH /api/projects/reorder — the full featured list in the new
 *  display order (array index becomes `featured_order`), each entry carrying
 *  the tile's `col_span` for the bento layout. */
export const featuredReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        col_span: z.number().int().min(1).max(MAX_FEATURED_COL_SPAN),
      }),
    )
    .min(1)
    .max(MAX_FEATURED_PROJECTS),
});

export type FeaturedReorderInput = z.infer<typeof featuredReorderSchema>;

/* ── Contact form ── */

/** Payload for POST /api/contact. `company` is a honeypot: real visitors
 *  never see or fill it, so a non-empty value marks the submission as a bot. */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(10).max(5000),
  company: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
