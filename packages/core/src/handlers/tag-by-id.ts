import "server-only";
import { apiError, apiSuccess } from "../api/response";
import { tagUpdateSchema } from "../api/schemas";
import { validate } from "../api/validate";
import { withAuth } from "../api/with-auth";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { TagRow } from "../types/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/tags/[id] — edit a tag (authenticated). */
export const updateTagById = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(tagUpdateSchema, body);
  if (!parsed.ok) return parsed.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tags")
    .update(parsed.data)
    .eq("id", id)
    .select("*")
    .single();
  if (error) return apiError("DB_UPDATE_FAILED", error.message, 500);
  return apiSuccess<TagRow>(data as TagRow);
});

/** DELETE /api/tags/[id] — remove a tag (authenticated). photo_tags rows
 *  referencing it are cascade-deleted by the FK. */
export const deleteTagById = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("tags").delete().eq("id", id);
  if (error) return apiError("DB_DELETE_FAILED", error.message, 500);
  return apiSuccess({ id });
});
