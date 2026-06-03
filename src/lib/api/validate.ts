import type { ZodType } from "zod";
import { apiError } from "./response";

type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response };

/** Validate an input against a zod schema, returning either the typed data or
 *  a ready-to-return standardized 422 error envelope. Keeps every route's
 *  validation path identical. */
export function validate<T>(
  schema: ZodType<T>,
  input: unknown,
): ValidationResult<T> {
  const result = schema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      response: apiError(
        "VALIDATION_ERROR",
        "Invalid request payload",
        422,
        result.error.issues,
      ),
    };
  }
  return { ok: true, data: result.data };
}
