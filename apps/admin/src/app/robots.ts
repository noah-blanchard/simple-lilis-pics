import type { MetadataRoute } from "next";

/** The CMS is private: keep every crawler out. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
