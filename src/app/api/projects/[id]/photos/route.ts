import { apiError, apiSuccess } from "@/lib/api/response";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_BYTES,
  projectPhotoMetaSchema,
} from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { PHOTOS_BUCKET } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/projects/[id]/photos — upload a single photo to an existing
 *  project (metadata-only created). Used by the sequential-upload retry flow
 *  when the initial batch POST fails with a 413 (entity too large).
 *
 *  FormData fields:
 *    file         File     (1, ≤5 MB, JPEG/PNG/WebP/AVIF)
 *    orientation  string   landscape | portrait
 *    position     string   0-based index
 *
 *  Returns the created project_photos row id. */
export const POST = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id: projectId } = await ctx.params;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(
      "INVALID_FORM_DATA",
      "Request body must be multipart form data",
      400,
    );
  }

  // ── 1) Validate the project exists ────────────────────────────
  const admin = createSupabaseAdminClient();
  const { data: project, error: projectErr } = await admin
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();

  if (projectErr || !project) {
    return apiError("NOT_FOUND", "Project not found", 404);
  }

  // ── 2) Validate the file ──────────────────────────────────────
  const rawFile = formData.get("file");

  if (!(rawFile instanceof File) || rawFile.size === 0) {
    return apiError("NO_FILE", "A single photo file is required", 422);
  }

  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(rawFile.type)) {
    return apiError(
      "INVALID_TYPE",
      `Unsupported image type: ${rawFile.type}`,
      422,
    );
  }

  if (rawFile.size > MAX_FILE_BYTES) {
    return apiError("FILE_TOO_LARGE", "Image must be ≤ 5 MB", 422);
  }

  // ── 3) Validate orientation + position ────────────────────────
  const metaParsed = validate(projectPhotoMetaSchema, {
    orientation: formData.get("orientation")?.toString() ?? "landscape",
    position: Number(formData.get("position")?.toString() ?? 0),
  });
  if (!metaParsed.ok) return metaParsed.response;
  const { orientation, position } = metaParsed.data;

  // ── 4) Upload to storage ──────────────────────────────────────
  const ext = (rawFile.name.split(".").pop() ?? "jpg").toLowerCase();
  const key = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadErr } = await admin.storage
    .from(PHOTOS_BUCKET)
    .upload(key, rawFile, {
      contentType: rawFile.type,
      upsert: false,
    });

  if (uploadErr) {
    return apiError("UPLOAD_FAILED", uploadErr.message, 500);
  }

  // ── 5) Insert project_photos row ──────────────────────────────
  const { data: photo, error: photoErr } = await admin
    .from("project_photos")
    .insert({
      project_id: projectId,
      image_path: key,
      orientation,
      position,
    })
    .select("id")
    .single();

  if (photoErr || !photo) {
    // Clean up the uploaded file
    await admin.storage.from(PHOTOS_BUCKET).remove([key]);
    return apiError(
      "DB_PHOTOS_FAILED",
      photoErr?.message ?? "Photo insert failed",
      500,
    );
  }

  return apiSuccess({ id: photo.id }, { status: 201 });
});
