import type { MetadataRoute } from "next";

/** The wedding site stays out of search engines until the operator's launch
 *  checklist (docs/plans/wedding/README.md §6). */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
  // Launch (README §6): replace with
  // return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
