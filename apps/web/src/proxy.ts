import { routing } from "@lili/core/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

// Next.js 16 renamed `middleware` to `proxy`. The admin CMS lives in its own
// app (admin.lilispics.com); old /admin and /login URLs are redirected by
// next.config.ts before this runs. This proxy only localizes the public site.
const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The hidden rating flow carries its locale as a path segment (/rate/fr/…)
  // rather than a next-intl prefix, so a scanned QR always opens in the
  // language Lili picked. Let it through untouched — next-intl would otherwise
  // read "rate" as an unknown locale and redirect to /en/rate/….
  if (pathname.startsWith("/rate")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals (_next, _vercel)
  // - files with an extension (e.g. /favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
