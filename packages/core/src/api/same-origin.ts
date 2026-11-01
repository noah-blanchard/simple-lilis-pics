/** Origin the browser used to reach this server. Behind a TLS-terminating
 *  reverse proxy (Traefik on Dokploy) `request.url` can carry the internal
 *  scheme/host, so prefer the standard forwarded headers when present. */
export function publicRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto =
    request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    url.protocol.replace(/:$/, "");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host") ||
    url.host;
  return `${proto}://${host}`;
}

/** Browser same-origin guard for best-effort public beacons. Not an auth
 *  boundary — it only stops other sites from inflating click counts. */
export function isSameOriginRequest(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return (
    origin === new URL(request.url).origin ||
    origin === publicRequestOrigin(request)
  );
}
