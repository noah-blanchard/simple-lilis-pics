import { connection } from "next/server";
import { RateExperience } from "@/components/rate/RateExperience";
import { RateExpired } from "@/components/rate/RateExpired";
import type { Locale } from "@/i18n/routing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/** True when the token exists, has not been spent, and is still inside its TTL.
 *  This is only the *display* check — POST /api/ratings re-checks the same
 *  conditions atomically when the rating is actually submitted, so a token
 *  spent between page load and submit is still rejected. */
async function isTokenOpen(token: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("rating_tokens")
    .select("used_at, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) return false;
  if (data.used_at) return false;
  return new Date(data.expires_at) > new Date();
}

export default async function RatePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  // A token's used/expired state must never be served from a cache, and the
  // lookup below uses no request-time API of its own.
  await connection();

  const { locale, token } = await params;
  const open = await isTokenOpen(token);

  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 py-10">
      {open ? (
        <RateExperience token={token} locale={locale as Locale} />
      ) : (
        <RateExpired locale={locale as Locale} />
      )}
    </main>
  );
}
