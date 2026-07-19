"use client";

import { useTranslations } from "next-intl";
import { PillButton } from "@/components/PillButton";

// Localized 404 rendered within the [locale] layout (so it inherits the theme,
// fonts and next-intl provider). Triggered by notFound() — e.g. an unknown
// /portfolio/[id] or a photo-less project.
export default function NotFound() {
  const t = useTranslations("portfolio");
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-ink px-6 text-center text-fg">
      <p className="tag-mono text-fg/45">404</p>
      <h1 className="display text-4xl md:text-6xl">{t("notFound")}</h1>
      <PillButton href="/" variant="light">
        <span aria-hidden>← </span>
        {t("backHome")}
      </PillButton>
    </main>
  );
}
