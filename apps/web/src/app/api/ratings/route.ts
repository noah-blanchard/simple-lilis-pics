import { apiError, apiSuccess } from "@/lib/api/response";
import { ratingSubmitSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { RatingRow } from "@/types/db";

/** Empty optional text is stored as NULL, never as "" — the testimonials query
 *  and the "anonymous" fallback both branch on null. */
function nullIfBlank(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** POST /api/ratings — public (no auth), gated by a single-use token.
 *  The token is *claimed* before the rating is inserted: the conditional
 *  UPDATE below only matches a token that is still unused and unexpired, and
 *  Postgres serializes concurrent updates of the same row, so a double-tap or
 *  a re-scan loses the race and gets a 410 instead of a second rating. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(ratingSubmitSchema, body);
  if (!parsed.ok) return parsed.response;

  const { token, stars, note, name, company } = parsed.data;

  // Honeypot: real visitors never see or fill this field. Pretend success so
  // bots don't learn their submission was rejected.
  if (company) {
    return apiSuccess({ id: "ok" }, { status: 201 });
  }

  const admin = createSupabaseAdminClient();

  const { data: claimed, error: claimError } = await admin
    .from("rating_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id, locale")
    .maybeSingle();

  if (claimError) return apiError("DB_UPDATE_FAILED", claimError.message, 500);
  if (!claimed) {
    return apiError(
      "TOKEN_INVALID",
      "This rating link is invalid, expired, or already used",
      410,
    );
  }

  const { data, error } = await admin
    .from("ratings")
    .insert({
      token_id: claimed.id,
      stars,
      note: nullIfBlank(note),
      name: nullIfBlank(name),
      locale: claimed.locale,
    })
    .select("*")
    .single();
  if (error) return apiError("DB_INSERT_FAILED", error.message, 500);

  return apiSuccess<RatingRow>(data as RatingRow, { status: 201 });
}

/** GET /api/ratings — admin list, newest first (authenticated). */
export const GET = withAuth(async () => {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("ratings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return apiError("DB_SELECT_FAILED", error.message, 500);
  return apiSuccess<RatingRow[]>((data ?? []) as RatingRow[]);
});
