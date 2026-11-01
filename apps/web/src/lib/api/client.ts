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
    // Vercel rejects oversized bodies (413) with a plain-text page.
    if (res.status === 413) {
      throw new Error("Upload too large for the server (413)");
    }
    throw new Error(`Unexpected response (${res.status})`);
  }

  if (!body.ok) throw new Error(body.error.message);
  return body.data;
}
