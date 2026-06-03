import type { ApiResponse } from "./response";

/** Client-side fetch helper that speaks the standardized API envelope:
 *  unwraps `{ ok: true, data }` or throws `error.message` on `{ ok: false }`.
 *  Use from TanStack Query queries/mutations in the admin UI. */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new Error(`Unexpected response (${res.status})`);
  }

  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}
