"use client";

import type { Locale } from "@lili/core/i18n/routing";
import { WAX_COLOR, WaxSeal } from "@lili/ui/components/WaxSeal";
import { EASE } from "@lili/ui/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { SEAL } from "@/lib/motion";
import { Postmark } from "./Postmark";
import { TextLink } from "./TextLink";

interface SealedEnvelopeProps {
  title: string;
  message: string;
  cardHeading: string;
  resetLabel: string;
  locale: Locale;
  onReset: () => void;
}

/** Seal the reply: the card slides into the envelope, the flap closes, the
 *  wax presses, a cyanotype postmark stamps last. With reduced motion the
 *  sealed envelope appears as is. */
export const SealedEnvelope = ({
  title,
  message,
  cardHeading,
  resetLabel,
  locale,
  onReset,
}: SealedEnvelopeProps) => {
  const reduce = useReducedMotion();
  const copyIn = (delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 8 },
    animate: reduce ? undefined : { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: EASE },
  });

  return (
    <output
      aria-live="polite"
      className="flex flex-col items-center px-4 py-10 text-center"
    >
      <p className="sr-only">
        {title}. {message}
      </p>
      <div className="relative aspect-[300/190] w-[408px] max-w-[88vw] [perspective:900px]">
        <div className="absolute inset-0 rounded-[5px] border border-line-strong bg-panel2 shadow-[0_12px_26px_-18px_rgba(0,0,0,0.35)]" />

        <motion.div
          className="absolute inset-x-[7%] top-[8%] grid h-[80%] place-items-center rounded-[2px] bg-sheet text-cyanotype"
          initial={reduce ? undefined : { y: "-70%" }}
          animate={reduce ? undefined : { y: "0%" }}
          transition={SEAL.cardIn}
        >
          <span className="font-display text-[22px] italic">{cardHeading}</span>
        </motion.div>

        {/* Front pocket: the two lower triangles and the side seams. */}
        <svg
          viewBox="0 0 300 190"
          fill="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path d="M0 190 L150 96 L300 190 Z" className="fill-panel2" />
          <path d="M0 0 L150 96 L0 190 Z" className="fill-panel2" />
          <path d="M300 0 L150 96 L300 190 Z" className="fill-panel2" />
          <g className="stroke-line" strokeWidth={1.25} strokeLinecap="round">
            <path d="M0 0 L150 96" />
            <path d="M300 0 L150 96" />
            <path d="M0 190 L150 96" />
            <path d="M300 190 L150 96" />
          </g>
        </svg>

        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[56%] origin-top bg-panel [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]"
          initial={reduce ? undefined : { rotateX: 180 }}
          animate={reduce ? undefined : { rotateX: 0 }}
          transition={SEAL.flap}
        />

        {/* The wax seal, where the flap's point lands. */}
        <div className="-translate-x-1/2 -translate-y-1/2 absolute top-[56%] left-1/2">
          {!reduce && (
            <motion.span
              aria-hidden
              className="-m-4 absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, color-mix(in srgb, ${WAX_COLOR} 55%, transparent) 0%, transparent 70%)`,
              }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [0.6, 1.8], opacity: [0.5, 0] }}
              transition={{
                delay: SEAL.sealAt + 0.08,
                duration: 0.8,
                ease: EASE,
              }}
            />
          )}
          <motion.div
            className="relative h-20 w-20 drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]"
            initial={reduce ? undefined : { scale: 0, opacity: 0, rotate: -14 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 520,
                damping: 17,
                delay: SEAL.sealAt,
              },
              rotate: {
                type: "spring",
                stiffness: 300,
                damping: 13,
                delay: SEAL.sealAt,
              },
              opacity: { duration: 0.15, delay: SEAL.sealAt },
            }}
          >
            <WaxSeal className="h-full w-full" idSuffix="-reply" />
          </motion.div>
        </div>

        <motion.div
          className="-top-7 -right-4 absolute w-[104px] rotate-[14deg]"
          initial={reduce ? undefined : { scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={SEAL.postmark}
        >
          <Postmark locale={locale} />
        </motion.div>
      </div>

      <motion.h3
        {...copyIn(SEAL.copyAt)}
        className="mt-10 font-display text-[28px]"
      >
        {title}
      </motion.h3>
      <motion.p
        {...copyIn(SEAL.copyAt + 0.15)}
        className="mt-3 max-w-[26em] text-muted"
      >
        {message}
      </motion.p>
      <TextLink onClick={onReset} className="mt-8">
        {resetLabel}
      </TextLink>
    </output>
  );
};
