import { apiError, apiSuccess } from "@/lib/api/response";
import { tagCreateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TagRow } from "@/types/db";

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

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("tags")
    .insert(parsed.data)
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") {
      return apiError(
        "DUPLICATE_SLUG",
        "A tag with this slug already exists",
        409,
      );
    }
    return apiError("DB_INSERT_FAILED", error.message, 500);
  }
  return apiSuccess<TagRow>(data as TagRow, { status: 201 });
});
