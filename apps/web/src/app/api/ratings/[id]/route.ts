import { apiError, apiSuccess } from "@/lib/api/response";
import { ratingUpdateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { RatingRow } from "@/types/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/ratings/[id] — approve or unapprove a rating (authenticated).
 *  `approved` is the only gate between a stranger's note and the public
 *  testimonials section. */
export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(ratingUpdateSchema, body);
  if (!parsed.ok) return parsed.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ratings")
    .update({ approved: parsed.data.approved })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return apiError("DB_UPDATE_FAILED", error.message, 500);
  return apiSuccess<RatingRow>(data as RatingRow);
});

/** DELETE /api/ratings/[id] — discard a rating (authenticated). The token row
 *  stays behind, still marked used, so the link can't be replayed. */
export const DELETE = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("ratings").delete().eq("id", id);
  if (error) return apiError("DB_DELETE_FAILED", error.message, 500);
  return apiSuccess({ id });
});
