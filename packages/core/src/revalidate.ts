import "server-only";
import type { PublicCacheTag } from "./cache-tags";

const REVALIDATE_TIMEOUT_MS = 5000;

/** Public app origins that cache CMS data: the portfolio and the wedding site. */
function revalidationTargets(): string[] {
  return [process.env.PORTFOLIO_URL, process.env.WEDDING_URL].filter(
    (url): url is string => Boolean(url),
  );
}

/** Ask every public app to drop the given cache tags. Best effort: a failure is
 *  logged and never fails the admin mutation — the data is already saved, and
 *  the public cache still expires on its own `revalidate` window (300 s for
 *  links). Never logs the secret. */
export async function requestPublicRevalidation(
  tags: PublicCacheTag[],
): Promise<void> {
  const secret = process.env.REVALIDATE_SECRET;
  const targets = revalidationTargets();
  if (!secret || targets.length === 0) {
    console.warn(
      "[revalidate] REVALIDATE_SECRET, PORTFOLIO_URL or WEDDING_URL is not set; public caches will refresh on their own schedule",
    );
    return;
  }

  await Promise.all(
    targets.map(async (base) => {
      const url = `${base.replace(/\/$/, "")}/api/revalidate`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${secret}`,
          },
          body: JSON.stringify({ tags }),
          cache: "no-store",
          signal: AbortSignal.timeout(REVALIDATE_TIMEOUT_MS),
        });
        if (!response.ok) {
          console.error(`[revalidate] ${url} responded ${response.status}`);
        }
      } catch (error) {
        console.error(
          `[revalidate] ${url} failed:`,
          error instanceof Error ? error.message : error,
        );
      }
    }),
  );
}
