"use client";

import { routing } from "@lili/core/i18n/routing";
import { hoverColorTransition } from "@lili/ui/lib/motion";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";

// Adapted from apps/web: toggles the locale while keeping the pathname. Set in
// Outfit (no mono on the wedding site); the pill shape is allowed (D2).
export const LocaleSwitcher = () => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: a fieldset would bring its own border and legend styling into a pill.
    <div
      role="group"
      aria-label={t("localeLabel")}
      className="flex items-center gap-1 rounded-full border border-fg/15 p-1 font-medium text-[12px] tracking-[0.06em]"
    >
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <motion.button
            key={loc}
            type="button"
            onClick={() => onSelect(loc)}
            disabled={isPending}
            aria-pressed={active}
            className={`cursor-pointer rounded-full px-3 py-1.5 uppercase ${
              active ? "bg-inverse text-on-inverse" : "text-fg/70"
            }`}
            whileHover={active ? undefined : { color: "var(--fg)" }}
            transition={hoverColorTransition}
          >
            {loc}
          </motion.button>
        );
      })}
    </div>
  );
};
