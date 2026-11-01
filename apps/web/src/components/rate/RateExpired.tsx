"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { EASE } from "@/lib/motion";
import { PillButton } from "../PillButton";
import { StarIcon } from "./StarIcon";

interface RateExpiredProps {
  locale: Locale;
}

/** Dead end for a token that is unknown, already spent, or past its 24h TTL.
 *  A stranger who lands here did nothing wrong, so it reads as an explanation
 *  and an invitation rather than an error. */
export const RateExpired = ({ locale }: RateExpiredProps) => {
  const t = useTranslations("rate.expired");
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex max-w-[380px] flex-col items-center text-center"
    >
      <span className="text-line-strong">
        <StarIcon className="h-12 w-12" filled={false} />
      </span>

      <h1 className="mt-6 font-display text-[30px] leading-tight">
        {t("title")}
      </h1>

      <p className="mt-3 text-[15px] text-fg/60 leading-relaxed">{t("body")}</p>

      <div className="mt-8">
        <PillButton variant="light" href={locale === "fr" ? "/fr" : "/"}>
          {t("cta")}
        </PillButton>
      </div>
    </motion.div>
  );
};
