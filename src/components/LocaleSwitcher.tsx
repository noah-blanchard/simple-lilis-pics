"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

// Toggles the active locale while preserving the current pathname.
export const LocaleSwitcher = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelect = (next: string) => {
    if (next === locale) return;
    startTransition(() => {
      // `pathname` here is locale-agnostic; the router re-prefixes it.
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div className="tag-mono flex items-center gap-1 rounded-full border border-white/15 p-1">
      {routing.locales.map((loc) => {
        const active = loc === locale;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => onSelect(loc)}
            disabled={isPending}
            aria-pressed={active}
            className={`rounded-full px-3 py-1.5 uppercase transition-colors ${
              active
                ? "bg-white text-ink"
                : "text-white/70 hover:text-white"
            }`}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
};
