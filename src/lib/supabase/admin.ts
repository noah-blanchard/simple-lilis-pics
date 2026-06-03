import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey)
  throw new Error("Missing env var: SUPABASE_SERVICE_ROLE_KEY");

/** Service-role Supabase client. Bypasses RLS — use ONLY inside route handlers
 *  on the server, never in client code. Auth is enforced by `withAuth` before
 *  this client touches the database or storage. */
export function createSupabaseAdminClient() {
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
