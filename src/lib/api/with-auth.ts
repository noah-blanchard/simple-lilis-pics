import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { apiError } from "./response";

interface AuthedArgs<Ctx> {
  request: Request;
  user: User;
  /** Route context (e.g. `{ params: Promise<{ id: string }> }` for [id] routes). */
  ctx: Ctx;
}

type AuthedHandler<Ctx> = (
  args: AuthedArgs<Ctx>,
) => Response | Promise<Response>;

/** Wraps a route handler so it only runs for an authenticated user.
 *  Validates the session server-side via Supabase (the real boundary stays the
 *  DB-level RLS). Returns a standardized 401 envelope otherwise. */
export function withAuth<Ctx = unknown>(handler: AuthedHandler<Ctx>) {
  return async (request: Request, ctx: Ctx): Promise<Response> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return apiError("UNAUTHORIZED", "Authentication required", 401);
    }

    return handler({ request, user, ctx });
  };
}
