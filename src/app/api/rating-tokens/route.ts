import { apiError, apiSuccess } from "@/lib/api/response";
import { ratingTokenCreateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { buildRateUrl, generateRatingToken } from "@/lib/rating";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface RatingTokenCreated {
  token: string;
  /** Absolute URL to encode in the QR code. */
  url: string;
  expires_at: string;
}

/** POST /api/rating-tokens — mint a single-use rating link (authenticated).
 *  Lili calls this from her phone in the field; the response is rendered as a
 *  QR code she shows to the person she just photographed. `expires_at` is left
 *  to the column default so the TTL has one definition (the migration). */
export const POST = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(ratingTokenCreateSchema, body);
  if (!parsed.ok) return parsed.response;

  const { locale } = parsed.data;
  const token = generateRatingToken();

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("rating_tokens")
    .insert({ token, locale })
    .select("token, expires_at")
    .single();
  if (error) return apiError("DB_INSERT_FAILED", error.message, 500);

  return apiSuccess<RatingTokenCreated>(
    {
      token: data.token,
      url: buildRateUrl(locale, data.token),
      expires_at: data.expires_at,
    },
    { status: 201 },
  );
});
