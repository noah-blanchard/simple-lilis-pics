import { apiError, apiSuccess } from "@/lib/api/response";
import { translateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import {
  TranslateConfigError,
  TranslateUpstreamError,
  translateText,
} from "@/lib/translate/openrouter";

/** POST /api/translate — translate a title/description between FR and EN via
 *  OpenRouter (authenticated). Proxies the request so the API key stays
 *  server-side and never reaches the browser. */
export const POST = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(translateSchema, body);
  if (!parsed.ok) return parsed.response;

  try {
    const translation = await translateText(parsed.data);
    return apiSuccess({ translation });
  } catch (err) {
    if (err instanceof TranslateConfigError) {
      return apiError("CONFIG_ERROR", err.message, 500);
    }
    if (err instanceof TranslateUpstreamError) {
      return apiError("TRANSLATE_FAILED", err.message, err.status);
    }
    const message = err instanceof Error ? err.message : "Translation failed";
    return apiError("TRANSLATE_FAILED", message, 502);
  }
});
