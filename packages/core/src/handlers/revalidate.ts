import "server-only";
import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { apiError, apiSuccess } from "../api/response";
import { validate } from "../api/validate";
import { PUBLIC_CACHE_TAGS } from "../cache-tags";

const revalidateBodySchema = z.object({
  tags: z.array(z.enum(PUBLIC_CACHE_TAGS)).min(1),
});

function bearerMatches(header: string | null, secret: string): boolean {
  const prefix = "Bearer ";
  if (!header?.startsWith(prefix)) return false;
  const given = Buffer.from(header.slice(prefix.length));
  const expected = Buffer.from(secret);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** POST /api/revalidate — server-to-server webhook called by the admin app
 *  after a CMS mutation. Authenticated with the shared REVALIDATE_SECRET;
 *  only whitelisted public cache tags can be revalidated. */
export async function handleRevalidateWebhook(
  request: Request,
): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return apiError(
      "REVALIDATE_DISABLED",
      "Revalidation is not configured",
      503,
    );
  }
  if (!bearerMatches(request.headers.get("authorization"), secret)) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(revalidateBodySchema, body);
  if (!parsed.ok) return parsed.response;

  for (const tag of parsed.data.tags) {
    revalidateTag(tag, { expire: 0 });
  }
  return apiSuccess({ revalidated: parsed.data.tags });
}
