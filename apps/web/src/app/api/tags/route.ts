import { apiError, apiSuccess } from "@lili/core/api/response";
import { tagCreateSchema } from "@lili/core/api/schemas";
import { validate } from "@lili/core/api/validate";
import { withAuth } from "@lili/core/api/with-auth";
import { slugify } from "@lili/core/slugify";
import { createSupabaseAdminClient } from "@lili/core/supabase/admin";
import { createSupabaseServerClient } from "@lili/core/supabase/server";
import type { TagRow } from "@lili/core/types/db";

/** GET /api/tags — public list of the tag taxonomy (alphabetical by EN label). */
export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("label_en", { ascending: true });
  if (error) return apiError("DB_ERROR", error.message, 500);
  return apiSuccess<TagRow[]>((data ?? []) as TagRow[]);
}

/** POST /api/tags — create a tag (authenticated). */
export const POST = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(tagCreateSchema, body);
  if (!parsed.ok) return parsed.response;

  // Slug is derived from the English label, never chosen by the admin.
  const slug =
    slugify(parsed.data.label_en) || `tag-${crypto.randomUUID().slice(0, 8)}`;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tags")
    .insert({ ...parsed.data, slug })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      return apiError(
        "DUPLICATE_LABEL",
        "A tag with this English label already exists",
        409,
      );
    }
    return apiError("DB_INSERT_FAILED", error.message, 500);
  }
  return apiSuccess<TagRow>(data as TagRow, { status: 201 });
});
