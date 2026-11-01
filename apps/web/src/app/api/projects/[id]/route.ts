import { apiError, apiSuccess } from "@/lib/api/response";
import { MAX_FEATURED_PROJECTS, projectUpdateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { PHOTOS_BUCKET } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/projects/[id] — edit metadata, tags, featured, cover, photo order/orientation.
 *  v1: does not add or remove photos — only edits existing project_photos rows. */
export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(projectUpdateSchema, body);
  if (!parsed.ok) return parsed.response;
  const { tag_ids, cover_photo_id, photos, featured, ...scalarFields } =
    parsed.data;

  const admin = createSupabaseAdminClient();

  // ── Featured cap check (only when turning featured ON) ────────
  if (featured === true) {
    const { count, error: countErr } = await admin
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("featured", true)
      .neq("id", id);
    if (countErr) return apiError("DB_ERROR", countErr.message, 500);
    if ((count ?? 0) >= MAX_FEATURED_PROJECTS) {
      return apiError(
        "FEATURED_LIMIT",
        `Maximum ${MAX_FEATURED_PROJECTS} featured projects allowed`,
        409,
      );
    }
  }

  // ── Validate cover_photo_id belongs to this project ───────────
  if (cover_photo_id !== undefined) {
    const { data: coverRow, error: coverCheckErr } = await admin
      .from("project_photos")
      .select("id")
      .eq("id", cover_photo_id)
      .eq("project_id", id)
      .maybeSingle();
    if (coverCheckErr) return apiError("DB_ERROR", coverCheckErr.message, 500);
    if (!coverRow) {
      return apiError(
        "INVALID_COVER",
        "cover_photo_id does not belong to this project",
        422,
      );
    }
  }

  // ── Update scalar project fields ──────────────────────────────
  const updatePayload: Record<string, unknown> = { ...scalarFields };
  if (featured !== undefined) updatePayload.featured = featured;
  if (cover_photo_id !== undefined)
    updatePayload.cover_photo_id = cover_photo_id;

  if (Object.keys(updatePayload).length > 0) {
    const { error: updateErr } = await admin
      .from("projects")
      .update(updatePayload)
      .eq("id", id);
    if (updateErr) return apiError("DB_UPDATE_FAILED", updateErr.message, 500);
  }

  // ── Replace tags ──────────────────────────────────────────────
  // There's no transaction across delete+insert, so snapshot the current links
  // first and best-effort restore them if the re-insert fails (avoids leaving
  // the project with no tags on a partial failure).
  if (tag_ids !== undefined) {
    const { data: prevRows } = await admin
      .from("project_tags")
      .select("tag_id")
      .eq("project_id", id);

    await admin.from("project_tags").delete().eq("project_id", id);

    if (tag_ids.length > 0) {
      const rows = tag_ids.map((tag_id) => ({ project_id: id, tag_id }));
      const { error: tagsErr } = await admin.from("project_tags").insert(rows);
      if (tagsErr) {
        const restore = (prevRows ?? []).map((r) => ({
          project_id: id,
          tag_id: (r as { tag_id: string }).tag_id,
        }));
        if (restore.length > 0) {
          await admin.from("project_tags").insert(restore);
        }
        return apiError("DB_TAGS_FAILED", tagsErr.message, 500);
      }
    }
  }

  // ── Update photo position / orientation ───────────────────────
  if (photos && photos.length > 0) {
    for (const photo of photos) {
      const { error: photoErr } = await admin
        .from("project_photos")
        .update({ position: photo.position, orientation: photo.orientation })
        .eq("id", photo.id)
        .eq("project_id", id); // ownership check
      if (photoErr)
        return apiError("DB_PHOTO_UPDATE_FAILED", photoErr.message, 500);
    }
  }

  return apiSuccess({ id });
});

/** DELETE /api/projects/[id] — remove project (cascade project_photos + project_tags)
 *  and delete all associated bucket objects. */
export const DELETE = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();

  // Fetch image paths before cascade-delete removes them.
  const { data: photoRows, error: fetchErr } = await admin
    .from("project_photos")
    .select("image_path")
    .eq("project_id", id);
  if (fetchErr) return apiError("DB_ERROR", fetchErr.message, 500);

  const { error: deleteErr } = await admin
    .from("projects")
    .delete()
    .eq("id", id);
  if (deleteErr) return apiError("DB_DELETE_FAILED", deleteErr.message, 500);

  // Remove bucket objects (skip legacy full URLs, e.g. Unsplash).
  const keys = (photoRows ?? [])
    .map((r) => (r as { image_path: string }).image_path)
    .filter((p) => !/^https?:\/\//.test(p));
  if (keys.length > 0) {
    // The DB row is already gone; a storage failure here only orphans objects,
    // so log it rather than failing the request.
    const { error: removeErr } = await admin.storage
      .from(PHOTOS_BUCKET)
      .remove(keys);
    if (removeErr) {
      console.error(
        `[projects] failed to remove ${keys.length} storage object(s) for project ${id}: ${removeErr.message}`,
      );
    }
  }

  return apiSuccess({ id });
});
