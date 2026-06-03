import { apiError, apiSuccess } from "@/lib/api/response";
import { photoUpdateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { PHOTOS_BUCKET } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/photos/[id] — edit metadata / featured / tags (authenticated).
 *  Tags, when provided, fully replace the existing set. */
export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(photoUpdateSchema, body);
  if (!parsed.ok) return parsed.response;
  const { tag_ids, ...fields } = parsed.data;

  const admin = createSupabaseAdminClient();

  if (Object.keys(fields).length > 0) {
    const { error } = await admin.from("photos").update(fields).eq("id", id);
    if (error) return apiError("DB_UPDATE_FAILED", error.message, 500);
  }

  if (tag_ids) {
    await admin.from("photo_tags").delete().eq("photo_id", id);
    if (tag_ids.length > 0) {
      const rows = tag_ids.map((tag_id) => ({ photo_id: id, tag_id }));
      const { error } = await admin.from("photo_tags").insert(rows);
      if (error) return apiError("DB_TAGS_FAILED", error.message, 500);
    }
  }

  return apiSuccess({ id });
});

/** DELETE /api/photos/[id] — remove the row (cascades photo_tags) and the
 *  bucket object. Legacy external URLs (Unsplash) have no object to delete. */
export const DELETE = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();

  const { data: photo, error: fetchError } = await admin
    .from("photos")
    .select("image_path")
    .eq("id", id)
    .single();
  if (fetchError || !photo) {
    return apiError("NOT_FOUND", "Photo not found", 404);
  }

  const { error: deleteError } = await admin
    .from("photos")
    .delete()
    .eq("id", id);
  if (deleteError)
    return apiError("DB_DELETE_FAILED", deleteError.message, 500);

  const imagePath = (photo as { image_path: string }).image_path;
  if (!/^https?:\/\//.test(imagePath)) {
    await admin.storage.from(PHOTOS_BUCKET).remove([imagePath]);
  }

  return apiSuccess({ id });
});
