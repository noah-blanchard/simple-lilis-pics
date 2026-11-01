import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "../env";

/** Service-role Supabase client. Bypasses RLS — use ONLY inside route handlers
 *  on the server, never in client code. Auth is enforced by `withAuth` before
 *  this client touches the database or storage.
 *
 *  The key is read per call rather than at module load: `next build` imports
 *  every route module, and the service-role key is a runtime-only secret that
 *  must never be a Docker build argument. */
export function createSupabaseAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
