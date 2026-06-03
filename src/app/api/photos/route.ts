import { apiError, apiSuccess } from "@/lib/api/response";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_BYTES,
  photoCreateSchema,
} from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { PHOTOS_BUCKET } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PhotoWithTags } from "@/types/db";

const PHOTO_SELECT = "*, tags(*)";

/** GET /api/photos — public list, newest first. `?featured=true` filters,
 *  `?limit=N` caps the result. Returns raw rows (admin list + tooling). */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("photos")
    .select(PHOTO_SELECT)
    .order("shoot_date", { ascending: false });

  if (searchParams.get("featured") === "true") {
    query = query.eq("featured", true);
  }
  const limit = Number(searchParams.get("limit"));
  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return apiError("DB_ERROR", error.message, 500);

  return apiSuccess<PhotoWithTags[]>(
    (data ?? []) as unknown as PhotoWithTags[],
  );
}

/** POST /api/photos — authenticated multipart upload (one photo).
 *  Order: upload to bucket → insert row → insert tags, with rollback on
 *  failure so we never leave an orphaned object or a tagless-broken state. */
export const POST = withAuth(async ({ request }) => {
  const formData = await request.formData();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return apiError("NO_FILE", "A photo file is required", 422);
  }
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return apiError(
      "INVALID_TYPE",
      `Unsupported image type: ${file.type}`,
      422,
    );
  }
  if (file.size > MAX_FILE_BYTES) {
    return apiError("FILE_TOO_LARGE", "Image exceeds the 5MB limit", 422);
  }

  const metaInput = {
    title_fr: formData.get("title_fr")?.toString() ?? "",
    title_en: formData.get("title_en")?.toString() ?? "",
    shoot_date: formData.get("shoot_date")?.toString() ?? "",
    featured: formData.get("featured")?.toString() === "true",
    tag_ids: formData
      .getAll("tag_ids")
      .filter((v): v is string => typeof v === "string"),
  };
  const parsed = validate(photoCreateSchema, metaInput);
  if (!parsed.ok) return parsed.response;
  const { tag_ids, ...meta } = parsed.data;

  const admin = createSupabaseAdminClient();
  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
  const objectKey = `${crypto.randomUUID()}.${ext}`;

  // 1) upload to the bucket
  const { error: uploadError } = await admin.storage
    .from(PHOTOS_BUCKET)
    .upload(objectKey, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    return apiError("UPLOAD_FAILED", uploadError.message, 500);
  }

  // 2) insert the photo row (rollback the object on failure)
  const { data: photo, error: insertError } = await admin
    .from("photos")
    .insert({ ...meta, image_path: objectKey })
    .select("id")
    .single();
  if (insertError || !photo) {
    await admin.storage.from(PHOTOS_BUCKET).remove([objectKey]);
    return apiError(
      "DB_INSERT_FAILED",
      insertError?.message ?? "Insert failed",
      500,
    );
  }

  // 3) link tags (rollback row + object on failure)
  if (tag_ids.length > 0) {
    const rows = tag_ids.map((tag_id) => ({ photo_id: photo.id, tag_id }));
    const { error: tagError } = await admin.from("photo_tags").insert(rows);
    if (tagError) {
      await admin.from("photos").delete().eq("id", photo.id);
      await admin.storage.from(PHOTOS_BUCKET).remove([objectKey]);
      return apiError("DB_TAGS_FAILED", tagError.message, 500);
    }
  }

  return apiSuccess({ id: photo.id }, { status: 201 });
});
