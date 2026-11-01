"use client";

import { useLocale, useTranslations } from "next-intl";
import { PillButton } from "@/components/PillButton";

export default function LinksError({ reset }: { reset: () => void }) {
  const t = useTranslations("links");
  const locale = useLocale();
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-5 bg-ink px-6 text-center text-fg">
      <h1 className="display text-4xl">{t("errorTitle")}</h1>
      <p className="max-w-sm text-[14px] text-fg/60 leading-relaxed">
        {t("errorBody")}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <PillButton onClick={reset}>{t("retry")}</PillButton>
        <PillButton href={locale === "fr" ? "/fr" : "/"} variant="ghost">
          {t("backHome")}
        </PillButton>
      </div>
    </main>
  );
}
