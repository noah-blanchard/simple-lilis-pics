import { apiError, apiSuccess } from "@/lib/api/response";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FEATURED_PROJECTS,
  MAX_FILE_BYTES,
  MAX_PROJECT_PHOTOS,
  ORIENTATIONS,
  projectCreateSchema,
} from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { PHOTOS_BUCKET } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectWithRelations } from "@/types/db";

// Disambiguate: two FKs exist between projects↔project_photos (project_id and
// cover_photo_id). Use the column hint so PostgREST picks the right direction.
const PROJECT_SELECT = "*, project_photos!project_id(*), project_tags(tags(*))";

/** GET /api/projects — public list, newest first.
 *  ?featured=true  filter to featured only
 *  ?limit=N        cap the result count */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("project_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (searchParams.get("featured") === "true") {
    query = query.eq("featured", true);
  }
  const limit = Number(searchParams.get("limit"));
  if (Number.isFinite(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) return apiError("DB_ERROR", error.message, 500);

  return apiSuccess<ProjectWithRelations[]>(
    (data ?? []) as unknown as ProjectWithRelations[],
  );
}

/** POST /api/projects — authenticated multipart upload (1–4 photos).
 *
 *  FormData fields:
 *    files          File[]  (1–4, each ≤5 MB, JPEG/PNG/WebP/AVIF)
 *    orientation    string[] aligned to files (landscape | portrait)
 *    position       string[] aligned to files (0..3)
 *    cover_index    string   index into files that becomes the cover
 *    title_fr/en    string?
 *    description_fr/en string?
 *    project_date   string?  YYYY-MM-DD
 *    featured       string   "true" | "false"
 *    tag_ids        string[] (repeated)
 *
 *  Rollback: on any failure after upload starts, all uploaded objects and the
 *  project row are removed so the DB stays clean.
 */
export const POST = withAuth(async ({ request }) => {
  const formData = await request.formData();

  // ── 1) Collect and validate files ────────────────────────────
  const rawFiles = formData.getAll("files");
  const files = rawFiles.filter(
    (f): f is File => f instanceof File && f.size > 0,
  );

  if (files.length === 0) {
    return apiError("NO_FILES", "At least one photo file is required", 422);
  }
  if (files.length > MAX_PROJECT_PHOTOS) {
    return apiError(
      "TOO_MANY_FILES",
      `Maximum ${MAX_PROJECT_PHOTOS} photos per project`,
      422,
    );
  }
  for (const file of files) {
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return apiError(
        "INVALID_TYPE",
        `Unsupported image type: ${file.type}`,
        422,
      );
    }
    if (file.size > MAX_FILE_BYTES) {
      return apiError("FILE_TOO_LARGE", "Each image must be ≤ 5 MB", 422);
    }
  }

  // ── 2) Parse per-photo metadata (orientation + position) ─────
  const orientations = formData.getAll("orientation");
  const positions = formData.getAll("position");

  const photoMetas: { orientation: string; position: number }[] = files.map(
    (_, i) => ({
      orientation: orientations[i]?.toString() ?? "landscape",
      position: Number(positions[i]?.toString() ?? i),
    }),
  );

  for (const meta of photoMetas) {
    if (!(ORIENTATIONS as readonly string[]).includes(meta.orientation)) {
      return apiError(
        "INVALID_ORIENTATION",
        `orientation must be landscape or portrait`,
        422,
      );
    }
  }

  // ── 3) Parse project metadata ─────────────────────────────────
  const metaInput = {
    title_fr: formData.get("title_fr")?.toString() || null,
    title_en: formData.get("title_en")?.toString() || null,
    description_fr: formData.get("description_fr")?.toString() || null,
    description_en: formData.get("description_en")?.toString() || null,
    project_date: formData.get("project_date")?.toString() || null,
    featured: formData.get("featured")?.toString() === "true",
    tag_ids: formData
      .getAll("tag_ids")
      .filter((v): v is string => typeof v === "string"),
    cover_index: Number(formData.get("cover_index")?.toString() ?? "0"),
  };

  const parsed = validate(projectCreateSchema, metaInput);
  if (!parsed.ok) return parsed.response;
  const { tag_ids, cover_index, ...projectMeta } = parsed.data;

  const admin = createSupabaseAdminClient();

  // ── 4) Featured cap check ─────────────────────────────────────
  if (projectMeta.featured) {
    const { count, error: countErr } = await admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("featured", true);
    if (countErr) return apiError("DB_ERROR", countErr.message, 500);
    if ((count ?? 0) >= MAX_FEATURED_PROJECTS) {
      return apiError(
        "FEATURED_LIMIT",
        `Maximum ${MAX_FEATURED_PROJECTS} featured projects allowed`,
        409,
      );
    }
  }

  // ── 5) Insert the project row (cover null for now) ────────────
  const { data: project, error: projectErr } = await admin
    .from("projects")
    .insert({ ...projectMeta, cover_photo_id: null })
    .select("id")
    .single();
  if (projectErr || !project) {
    return apiError(
      "DB_INSERT_FAILED",
      projectErr?.message ?? "Insert failed",
      500,
    );
  }
  const projectId = project.id;

  // Cleanup helper — called on any failure after this point.
  const uploadedKeys: string[] = [];
  async function cleanup() {
    if (uploadedKeys.length > 0) {
      await admin.storage.from(PHOTOS_BUCKET).remove(uploadedKeys);
    }
    await admin.from("projects").delete().eq("id", projectId);
  }

  // ── 6) Upload each file to the bucket ────────────────────────
  const objectKeys: string[] = [];
  for (const file of files) {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
    const key = `${crypto.randomUUID()}.${ext}`;
    const { error: uploadErr } = await admin.storage
      .from(PHOTOS_BUCKET)
      .upload(key, file, { contentType: file.type, upsert: false });
    if (uploadErr) {
      await cleanup();
      return apiError("UPLOAD_FAILED", uploadErr.message, 500);
    }
    uploadedKeys.push(key);
    objectKeys.push(key);
  }

  // ── 7) Insert project_photos rows ────────────────────────────
  const photoRows = objectKeys.map((key, i) => ({
    project_id: projectId,
    image_path: key,
    orientation: photoMetas[i].orientation,
    position: photoMetas[i].position,
  }));

  const { data: insertedPhotos, error: photosErr } = await admin
    .from("project_photos")
    .insert(photoRows)
    .select("id");
  if (photosErr || !insertedPhotos) {
    await cleanup();
    return apiError(
      "DB_PHOTOS_FAILED",
      photosErr?.message ?? "Photos insert failed",
      500,
    );
  }

  // ── 8) Set cover_photo_id ─────────────────────────────────────
  const safeIndex = Math.min(cover_index, insertedPhotos.length - 1);
  const coverId = (insertedPhotos[safeIndex] as { id: string }).id;
  const { error: coverErr } = await admin
    .from("projects")
    .update({ cover_photo_id: coverId })
    .eq("id", projectId);
  if (coverErr) {
    await cleanup();
    return apiError("DB_COVER_FAILED", coverErr.message, 500);
  }

  // ── 9) Insert project_tags ────────────────────────────────────
  if (tag_ids.length > 0) {
    const tagRows = tag_ids.map((tag_id) => ({
      project_id: projectId,
      tag_id,
    }));
    const { error: tagsErr } = await admin.from("project_tags").insert(tagRows);
    if (tagsErr) {
      await cleanup();
      return apiError("DB_TAGS_FAILED", tagsErr.message, 500);
    }
  }

  return apiSuccess({ id: projectId }, { status: 201 });
});
