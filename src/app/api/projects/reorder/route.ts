import { apiError, apiSuccess } from "@/lib/api/response";
import { featuredReorderSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** PATCH /api/projects/reorder — set the manual display order and bento tile
 *  size of the featured projects. Body: `{ items: { id, col_span }[] }`, the
 *  full featured list in the new order (index becomes `featured_order`,
 *  `col_span` becomes `featured_col_span`). */
export const PATCH = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(featuredReorderSchema, body);
  if (!parsed.ok) return parsed.response;
  const { items } = parsed.data;

  const admin = createSupabaseAdminClient();

  const { data: featuredRows, error: featuredErr } = await admin
    .from("projects")
    .select("id")
    .eq("featured", true);
  if (featuredErr) return apiError("DB_ERROR", featuredErr.message, 500);

  const featuredIds = new Set((featuredRows ?? []).map((r) => r.id as string));
  const unknown = items.find((item) => !featuredIds.has(item.id));
  if (unknown) {
    return apiError(
      "INVALID_ORDER",
      `${unknown.id} is not a currently-featured project`,
      422,
    );
  }

  for (const [index, item] of items.entries()) {
    const { error: updateErr } = await admin
      .from("projects")
      .update({ featured_order: index, featured_col_span: item.col_span })
      .eq("id", item.id);
    if (updateErr) return apiError("DB_UPDATE_FAILED", updateErr.message, 500);
  }

  return apiSuccess({ order: items.map((item) => item.id) });
});
