import { routing } from "@lili/core/i18n/routing";
import createMiddleware from "next-intl/middleware";

// Next.js 16 calls this file `proxy`. The wedding site is public and
// localized: English unprefixed, French under /fr (localePrefix "as-needed").
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except API routes, Next.js internals and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
