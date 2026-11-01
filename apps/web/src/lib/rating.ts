/** Constants + helpers for the hidden "rate the experience" flow.
 *  Shared by the API routes, the admin QR dialog and the rate page, so the
 *  promo code and the URL shape have exactly one definition. */

import type { Locale } from "@/i18n/routing";

/** Promo code offered in Lili's thank-you letter after a rating. */
export const RATING_PROMO_CODE = "MERCI40";

/** Discount the code grants, interpolated into the letter copy. */
export const RATING_PROMO_PERCENT = 40;

/** A token is single-use and short-lived: the QR is shown on Lili's phone to
 *  one person, right now. Kept in sync with the column default in
 *  `supabase/migrations/0008_ratings.sql`. */
export const RATING_TOKEN_TTL_HOURS = 24;

/** The testimonials marquee looks broken with one or two cards, so the whole
 *  section stays hidden until there are at least this many approved reviews. */
export const MIN_PUBLIC_TESTIMONIALS = 3;

/** localStorage key marking "this device already rated with token X", so a
 *  revisit lands on the thank-you view instead of an empty form. */
export const RATED_STORAGE_KEY = "lili-rated";

/** Crockford base32 — no I/L/O/U, so a code can't be misread off a screen. */
const TOKEN_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const TOKEN_LENGTH = 10; // 32^10 ≈ 50 bits

/** Generate a short, url-safe, unguessable token for one QR code. */
export function generateRatingToken(): string {
  const bytes = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  let token = "";
  for (const byte of bytes) {
    // 256 = 8 × 32, so the modulo maps bytes onto the alphabet uniformly —
    // no rejection sampling needed.
    token += TOKEN_ALPHABET[byte % TOKEN_ALPHABET.length];
  }
  return token;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3050";

/** Absolute URL encoded into the QR code. The locale is always explicit: a
 *  stranger's phone must not decide the language via cookie or Accept-Language,
 *  Lili picks it when she generates the code. */
export function buildRateUrl(locale: Locale, token: string): string {
  return `${SITE_URL.replace(/\/$/, "")}/rate/${locale}/${token}`;
}
