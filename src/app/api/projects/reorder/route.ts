import { apiError, apiSuccess } from "@/lib/api/response";
import { featuredReorderSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** PATCH /api/projects/reorder — set the manual display order of the
 *  featured projects. Body: `{ order: string[] }`, the full featured id
 *  list in the new order (index becomes `featured_order`). */
export const PATCH = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(featuredReorderSchema, body);
  if (!parsed.ok) return parsed.response;
  const { order } = parsed.data;

  const admin = createSupabaseAdminClient();

  const { data: featuredRows, error: featuredErr } = await admin
    .from("projects")
    .select("id")
    .eq("featured", true);
  if (featuredErr) return apiError("DB_ERROR", featuredErr.message, 500);

  const featuredIds = new Set((featuredRows ?? []).map((r) => r.id as string));
  const unknownId = order.find((id) => !featuredIds.has(id));
  if (unknownId) {
    return apiError(
      "INVALID_ORDER",
      `${unknownId} is not a currently-featured project`,
      422,
    );
  }

  for (const [index, id] of order.entries()) {
    const { error: updateErr } = await admin
      .from("projects")
      .update({ featured_order: index })
      .eq("id", id);
    if (updateErr) return apiError("DB_UPDATE_FAILED", updateErr.message, 500);
  }

  return apiSuccess({ order });
});
