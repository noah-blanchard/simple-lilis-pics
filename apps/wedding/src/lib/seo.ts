import { routing } from "@lili/core/i18n/routing";
import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";

/** Canonical and language alternates for a page. Paths are relative; the
 *  layout's `metadataBase` makes them absolute. English is unprefixed, French
 *  sits under /fr. */
export function pageAlternates(
  href: string,
  locale: string,
): NonNullable<Metadata["alternates"]> {
  const path = (l: string) => getPathname({ href, locale: l });
  return {
    canonical: path(locale),
    languages: Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
  };
}
