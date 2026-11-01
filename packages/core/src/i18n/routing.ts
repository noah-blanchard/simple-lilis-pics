import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // All locales the app supports.
  locales: ["en", "fr"],
  // Used when no locale matches.
  defaultLocale: "en",
  // English served at `/`, French at `/fr`.
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
