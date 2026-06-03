import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed `middleware` to `proxy` (same functionality, new file
// convention). next-intl's request handler is filename-agnostic, so we mount
// it here as the default export.
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - Next.js internals (_next, _vercel)
  // - files with an extension (e.g. /favicon.ico)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
