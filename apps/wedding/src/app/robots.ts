import type { MetadataRoute } from "next";

/** Scaffold only: keep the wedding site out of search engines until launch.
 *  Replace with real rules (and add a sitemap) when the site goes live. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
