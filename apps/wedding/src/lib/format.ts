import type { Locale } from "@lili/core/i18n/routing";

export type DayPart = "morning" | "afternoon" | "evening" | "night";
export type Season = "spring" | "summer" | "autumn" | "winter";

const NBSP = " ";

/** Minutes since midnight to "2:30 pm" (en) or "14 h 30" (fr, Québec usage).
 *  Minutes are always shown so the scroll clock keeps a constant width. */
export function formatTime(minutes: number, locale: Locale): string {
  const h = Math.floor(minutes / 60) % 24;
  const mm = String(minutes % 60).padStart(2, "0");
  if (locale === "fr") return `${h}${NBSP}h${NBSP}${mm}`;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm}${NBSP}${h < 12 ? "am" : "pm"}`;
}

/** Part of the day for the italic label beside the clock. */
export function dayPartOf(minutes: number): DayPart {
  if (minutes < 12 * 60) return "morning";
  if (minutes < 18 * 60) return "afternoon";
  if (minutes < 22 * 60) return "evening";
  return "night";
}

/** Whole-dollar CAD price: "$3,200" (en-CA) or "3 200 $" (fr-CA). */
export function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Northern-hemisphere season of an ISO date ("2025-10-04" to "autumn"). */
export function seasonOf(isoDate: string): Season {
  const month = Number(isoDate.slice(5, 7));
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

/** Long date for the privacy page and the postmark ("2 November 2026" / "2 novembre 2026"). */
export function formatLongDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Toronto",
  }).format(new Date(`${isoDate}T12:00:00`));
}
