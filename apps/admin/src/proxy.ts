import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@lili/core/env";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed `middleware` to `proxy`. The admin app is gated by
// Supabase Auth: refresh the session cookie on every page request and redirect
// between /login and /admin. DB-level RLS and `withAuth` remain the real
// security boundary; this only handles redirects + cookie refresh.
async function handleAdminAuth(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export default function proxy(request: NextRequest) {
  return handleAdminAuth(request);
}

export const config = {
  // Match all pathnames except API routes, Next.js internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
