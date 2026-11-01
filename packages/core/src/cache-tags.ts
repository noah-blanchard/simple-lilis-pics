/** Cache tags for public data cached with `unstable_cache`. The admin app
 *  cannot call `revalidateTag` on another app's cache, so after a CMS mutation
 *  it asks each public app to drop these tags via POST /api/revalidate. */
export const PUBLIC_CACHE_TAGS = ["public-links"] as const;

export type PublicCacheTag = (typeof PUBLIC_CACHE_TAGS)[number];

export const PUBLIC_LINKS_TAG: PublicCacheTag = "public-links";
