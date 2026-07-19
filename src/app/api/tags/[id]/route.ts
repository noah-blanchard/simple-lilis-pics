import { apiError, apiSuccess } from "@/lib/api/response";
import { tagUpdateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TagRow } from "@/types/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/tags/[id] — edit a tag (authenticated). */
export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {
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
export const DELETE = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("tags").delete().eq("id", id);
  if (error) return apiError("DB_DELETE_FAILED", error.message, 500);
  return apiSuccess({ id });
});
