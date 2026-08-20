import { z } from "zod";
import { LINK_ICON_KEYS, LINK_OPEN_BEHAVIORS } from "@/lib/links/constants";

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

/* ── Experience ratings (hidden QR/NFC flow) ── */

/** Body for POST /api/rating-tokens — Lili picks the language of the QR she is
 *  about to show, since the stranger's phone must not guess it. */
export const ratingTokenCreateSchema = z.object({
  locale: z.enum(["en", "fr"]),
});

/** Body for POST /api/ratings. Only `stars` is required — the whole point of
 *  the page is that a rating takes one tap. `company` is the same honeypot
 *  trick as the contact form. */
export const ratingSubmitSchema = z.object({
  token: z.string().trim().min(6).max(32),
  stars: z.number().int().min(1).max(5),
  note: z.string().trim().max(1000).optional(),
  name: z.string().trim().max(80).optional(),
  company: z.string().max(200).optional().default(""),
});

/** Body for PATCH /api/ratings/[id] — the admin approving a rating for the
 *  public testimonials. */
export const ratingUpdateSchema = z.object({
  approved: z.boolean(),
});

/** Read/unread intent for a contact message — the timestamp is set server-side. */
export const contactUpdateSchema = z.object({
  read: z.boolean(),
});

export type RatingTokenCreateInput = z.infer<typeof ratingTokenCreateSchema>;
export type RatingSubmitInput = z.infer<typeof ratingSubmitSchema>;
export type RatingUpdateInput = z.infer<typeof ratingUpdateSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;

/* ── Public links editor ── */

const nullableTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .transform((value) => value || null);

/** Only destinations that are useful to the portfolio and safe in an href. */
export const linkDestinationSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .superRefine((value, ctx) => {
    const hasControlCharacter = Array.from(value).some((character) => {
      const code = character.charCodeAt(0);
      return code < 32 || code === 127;
    });
    if (hasControlCharacter) {
      ctx.addIssue({
        code: "custom",
        message: "URL contains control characters",
      });
      return;
    }

    if (value.startsWith("/")) {
      if (value.startsWith("//")) {
        ctx.addIssue({
          code: "custom",
          message: "Protocol-relative URLs are not allowed",
        });
      }
      return;
    }

    if (value.startsWith("mailto:")) {
      const address = value.slice("mailto:".length);
      if (!z.string().email().safeParse(address).success) {
        ctx.addIssue({ code: "custom", message: "Invalid email destination" });
      }
      return;
    }

    try {
      const url = new URL(value);
      if (url.protocol !== "https:") {
        ctx.addIssue({
          code: "custom",
          message: "Only HTTPS URLs are allowed",
        });
      }
      if (url.username || url.password) {
        ctx.addIssue({
          code: "custom",
          message: "URL credentials are not allowed",
        });
      }
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid URL" });
    }
  });

export const linkEditorItemSchema = z
  .object({
    client_id: z.string().min(1).max(100),
    id: z.string().uuid().nullable(),
    name_en: nullableTrimmedText(120),
    name_fr: nullableTrimmedText(120),
    subtitle_en: nullableTrimmedText(240),
    subtitle_fr: nullableTrimmedText(240),
    url: linkDestinationSchema,
    icon_key: z.enum(LINK_ICON_KEYS).nullable(),
    published: z.boolean(),
    open_behavior: z.enum(LINK_OPEN_BEHAVIORS),
    updated_at: z.string().datetime().nullable(),
  })
  .superRefine((value, ctx) => {
    if (!value.name_en && !value.name_fr) {
      ctx.addIssue({
        code: "custom",
        path: ["name_en"],
        message: "At least one localized name is required",
      });
    }
    if (value.id && !value.updated_at) {
      ctx.addIssue({
        code: "custom",
        path: ["updated_at"],
        message: "Existing links require updated_at",
      });
    }
    if (!value.id && value.updated_at) {
      ctx.addIssue({
        code: "custom",
        path: ["updated_at"],
        message: "New links cannot have updated_at",
      });
    }
  });

export const linksEditorSaveSchema = z
  .object({
    expected_items: z.array(
      z.object({
        id: z.string().uuid(),
        updated_at: z.string().datetime(),
      }),
    ),
    items: z.array(linkEditorItemSchema).max(100),
  })
  .superRefine((value, ctx) => {
    const expectedIds = value.expected_items.map((item) => item.id);
    const existingIds = value.items.flatMap((item) =>
      item.id ? [item.id] : [],
    );
    const clientIds = value.items.map((item) => item.client_id);

    if (new Set(expectedIds).size !== expectedIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["expected_items"],
        message: "Duplicate expected id",
      });
    }
    if (new Set(existingIds).size !== existingIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Duplicate link id",
      });
    }
    if (new Set(clientIds).size !== clientIds.length) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Duplicate client id",
      });
    }
    if (existingIds.some((id) => !expectedIds.includes(id))) {
      ctx.addIssue({
        code: "custom",
        path: ["items"],
        message: "Unknown existing link id",
      });
    }
  });

export type LinkEditorItemInput = z.infer<typeof linkEditorItemSchema>;
export type LinksEditorSaveInput = z.infer<typeof linksEditorSaveSchema>;
