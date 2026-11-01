import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/env";

/** Supabase client for Server Components, Server Actions and Route Handlers.
 *  Uses the anon key + the request cookies, so RLS applies as the logged-in
 *  user (or anonymous). `cookies()` is async in Next 16. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // In Server Components writing cookies throws; the proxy refreshes
        // the session instead, so we can safely ignore the failure here.
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // no-op: called from a Server Component render
        }
      },
    },
  });
}
