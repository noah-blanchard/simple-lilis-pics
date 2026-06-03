/** Standardized API envelope. Every /api route returns one of these shapes,
 *  built via apiSuccess / apiError, so clients can branch on `ok`. */

export interface ApiSuccess<T> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

/** 200 by default; pass `init` to override status/headers (e.g. 201). */
export function apiSuccess<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { ok: true, data };
  return Response.json(body, { status: 200, ...init });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): Response {
  const body: ApiError = {
    ok: false,
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return Response.json(body, { status });
}
