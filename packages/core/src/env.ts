/** Public Supabase env vars, validated once at module load.
 *  Referenced statically (not via a dynamic key) so Next can inline the
 *  `NEXT_PUBLIC_*` values into the browser bundle. Server-only secrets
 *  (service role key) are read directly in `lib/supabase/admin.ts`. */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
if (!anonKey) throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;
export const PHOTOS_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "photos";
