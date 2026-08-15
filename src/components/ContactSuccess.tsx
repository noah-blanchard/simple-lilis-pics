"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";
import { PillButton } from "./PillButton";
import { WAX_COLOR, WaxSeal } from "./WaxSeal";

interface ContactSuccessProps {
  /** Headline (e.g. "Message sent"). */
  title: string;
  /** Reassurance copy shown under the headline. */
  message: string;
  /** Label for the control that returns to the empty form. */
  resetLabel: string;
  /** Swap back to the form. */
  onReset: () => void;
}

// The wax seal presses down with a spring "thunk" (scale overshoot + a small
// rotate settle) — the satisfying beat of the whole panel.
const SEAL_DELAY = 0.5;

/**
 * Success panel shown in place of the contact form after a message sends.
 * A premium envelope with the brand's signature stamped into a cognac wax seal:
 * the envelope settles in, then the seal presses down with a spring thunk, a
 * glow pulse + ripple spread, in parallel with the card's neon border surge.
 * All motion/react; static sealed envelope when the viewer prefers reduced motion.
 */
export const ContactSuccess = ({
  title,
  message,
  resetLabel,
  onReset,
}: ContactSuccessProps) => {
  const reduce = useReducedMotion();

  const copyIn = (delay: number) => ({
    initial: reduce ? undefined : { opacity: 0, y: 8 },
    animate: reduce ? undefined : { opacity: 1, y: 0 },
    transition: { delay, duration: 0.5, ease: EASE },
  });

  return (
    <motion.output
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex min-h-[420px] flex-col items-center justify-center px-7 py-14 text-center md:min-h-[460px] md:px-10"
    >
      {/* Envelope */}
      <motion.div
        initial={reduce ? undefined : { opacity: 0, x: -36 }}
        animate={reduce ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative aspect-[300/190] w-[408px] max-w-[88vw] rounded-[5px] border border-line-strong bg-panel2 shadow-[0_12px_26px_-18px_rgba(0,0,0,0.35)]"
      >
        {/* Flap seams + a lighter top flap for paper depth. */}
        <svg
          viewBox="0 0 300 190"
          fill="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M6 6 L294 6 L150 96 Z"
            className="fill-panel"
            opacity={0.6}
          />
          <g
            className="stroke-line"
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 6 L150 96" />
            <path d="M294 6 L150 96" />
            <path d="M6 184 L150 96" />
            <path d="M294 184 L150 96" />
          </g>
        </svg>

        {/* Luxe inset keyline (double-rule) + a whisper of top sheen. */}
        <div className="pointer-events-none absolute inset-[9px] rounded-[3px] border border-line/70" />
        <div className="pointer-events-none absolute inset-0 rounded-[5px] bg-gradient-to-b from-white/10 to-transparent" />

        {/* Wax seal — centered where the flaps meet. */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!reduce && (
            <>
              {/* Soft accent glow spreading from the impact. */}
              <motion.span
                aria-hidden
                className="absolute h-28 w-28 rounded-full"
                style={{
                  background: `radial-gradient(circle, color-mix(in srgb, ${WAX_COLOR} 60%, transparent) 0%, transparent 70%)`,
                }}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.9], opacity: [0.55, 0] }}
                transition={{
                  delay: SEAL_DELAY + 0.08,
                  duration: 0.8,
                  ease: EASE,
                }}
              />
              {/* Thin ring rippling outward as the wax lands. */}
              <motion.span
                aria-hidden
                className="absolute h-28 w-28 rounded-full border"
                style={{ borderColor: WAX_COLOR }}
                initial={{ scale: 0.75, opacity: 0.6 }}
                animate={{ scale: 1.7, opacity: 0 }}
                transition={{
                  delay: SEAL_DELAY + 0.1,
                  duration: 0.7,
                  ease: EASE,
                }}
              />
            </>
          )}

          <motion.div
            className="relative h-28 w-28 drop-shadow-[0_2px_5px_rgba(0,0,0,0.18)]"
            initial={reduce ? undefined : { scale: 0, opacity: 0, rotate: -14 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1, rotate: 0 }}
            transition={{
              scale: {
                type: "spring",
                stiffness: 520,
                damping: 17,
                delay: SEAL_DELAY,
              },
              rotate: {
                type: "spring",
                stiffness: 300,
                damping: 13,
                delay: SEAL_DELAY,
              },
              opacity: { duration: 0.15, delay: SEAL_DELAY },
            }}
          >
            <WaxSeal className="h-full w-full" idSuffix="-contact" />
          </motion.div>
        </div>
      </motion.div>

      <motion.h3
        {...copyIn(0.85)}
        className="mt-10 font-medium text-[22px] text-fg tracking-tight"
      >
        {title}
      </motion.h3>

      <motion.p
        {...copyIn(1.0)}
        className="mt-3 max-w-[420px] text-[15px] text-fg/65 leading-relaxed"
      >
        {message}
      </motion.p>

      <motion.div {...copyIn(1.2)} className="mt-8">
        <PillButton variant="ghost" size="sm" onClick={onReset}>
          {resetLabel}
        </PillButton>
      </motion.div>
    </motion.output>
  );
};
