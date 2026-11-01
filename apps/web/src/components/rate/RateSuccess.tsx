"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Locale } from "@/i18n/routing";
import { EASE } from "@/lib/motion";
import { PillButton } from "../PillButton";
import { StarIcon } from "./StarIcon";
import { ThankYouLetter } from "./ThankYouLetter";

interface RateSuccessProps {
  /** How many stars were given — the ones that fly in and merge. */
  stars: number;
  locale: Locale;
}

// Horizontal offsets (in px) the five stars occupy in the rating row, so the
// convergence starts from roughly where the fingers left them.
const ROW_OFFSETS = [-136, -68, 0, 68, 136];

/**
 * Shown in place of the form after a rating lands. The stars the visitor chose
 * fly in from their old positions and collapse into a single one, which drops
 * with a spring and blooms; the copy then rises on the same delay ladder the
 * contact-form success uses, so the two screens feel like one hand.
 *
 * The CTA does not navigate — it opens Lili's letter, which holds the promo
 * code and the actual way into the site.
 */
export const RateSuccess = ({ stars, locale }: RateSuccessProps) => {
  const t = useTranslations("rate.success");
  const reduce = useReducedMotion();
  const [letterOpen, setLetterOpen] = useState(false);

  const copyIn = (delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 8 },
    animate: reduce ? undefined : { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: EASE },
  });

  // Only the stars actually awarded take part in the merge.
  const flying = ROW_OFFSETS.slice(0, Math.max(stars, 1));

  return (
    <motion.output
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative flex h-32 w-full items-center justify-center">
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute h-32 w-32 rounded-full"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
            transition={{ delay: 0.55, duration: 0.9, ease: EASE }}
          />
        )}

        {/* The awarded stars slide in from the row and stack into one. */}
        {flying.map((offset, index) => (
          <motion.span
            key={offset}
            aria-hidden
            className="absolute text-accent"
            initial={
              reduce ? { opacity: 1 } : { x: offset, scale: 0.45, opacity: 1 }
            }
            animate={reduce ? { opacity: 1 } : { x: 0, scale: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    x: { duration: 0.5, ease: EASE, delay: index * 0.05 },
                    scale: {
                      type: "spring",
                      stiffness: 420,
                      damping: 16,
                      delay: 0.45,
                    },
                  }
            }
          >
            <StarIcon className="h-20 w-20" filled />
          </motion.span>
        ))}
      </div>

      <motion.h1
        {...copyIn(0.85)}
        className="mt-4 font-display text-[32px] leading-tight"
      >
        {t("title")}
      </motion.h1>

      <motion.p
        {...copyIn(1.0)}
        className="mt-3 max-w-[340px] text-[15px] text-fg/65 leading-relaxed"
      >
        {t("body")}
      </motion.p>

      <motion.div {...copyIn(1.2)} className="mt-9">
        <PillButton variant="light" onClick={() => setLetterOpen(true)}>
          {t("cta")}
        </PillButton>
      </motion.div>

      <ThankYouLetter
        open={letterOpen}
        locale={locale}
        onClose={() => setLetterOpen(false)}
      />
    </motion.output>
  );
};
