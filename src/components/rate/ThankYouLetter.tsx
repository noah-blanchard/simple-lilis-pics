"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/i18n/routing";
import { EASE } from "@/lib/motion";
import { RATING_PROMO_CODE, RATING_PROMO_PERCENT } from "@/lib/rating";
import { PillButton } from "../PillButton";
import { WaxSeal } from "../WaxSeal";

interface ThankYouLetterProps {
  open: boolean;
  locale: Locale;
  onClose: () => void;
}

/** Sealed → the flap is swinging open → the letter is unfolded and readable. */
type Phase = "sealed" | "opening" | "open";

/** How long the flap/seal choreography runs before the unfolded letter takes
 *  over. Matches the flap rotation below. */
const OPENING_MS = 900;

export const ThankYouLetter = ({
  open,
  locale,
  onClose,
}: ThankYouLetterProps) => {
  const t = useTranslations("rate.letter");
  const reduce = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("sealed");
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  // Reset to sealed whenever the letter is dismissed, so reopening it replays
  // the whole thing rather than dumping the visitor on the open page.
  useEffect(() => {
    if (!open) setPhase("sealed");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const openLetter = () => {
    if (phase !== "sealed") return;
    if (reduce) {
      setPhase("open");
      return;
    }
    navigator.vibrate?.(12);
    setPhase("opening");
    setTimeout(() => setPhase("open"), OPENING_MS);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(RATING_PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (insecure origin, denied permission) —
      // the code is written out in full right above the button anyway.
    }
  };

  const breaking = phase !== "sealed";

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={t("label")}
          className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <motion.button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-scrim backdrop-blur-sm"
          />

          <div className="relative z-10 w-full max-w-[360px]">
            <AnimatePresence mode="wait">
              {phase === "open" ? (
                /* ── The unfolded letter ── */
                <motion.div
                  key="sheet"
                  initial={
                    reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.55, ease: EASE }}
                  className="rounded-[10px] border border-line bg-panel px-7 py-9 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.45)]"
                >
                  {/* Paper rule, the way a note card is pre-printed. */}
                  <div className="pointer-events-none absolute inset-[10px] rounded-[6px] border border-line/60" />

                  <div className="relative">
                    <p className="font-display text-[26px] italic leading-snug">
                      {t("greeting")}
                    </p>

                    <p className="mt-4 text-[15px] text-fg/70 leading-relaxed">
                      {t("body", { percent: RATING_PROMO_PERCENT })}
                    </p>

                    <p className="mt-5 font-display text-[22px] italic">
                      — {t("signature")}
                    </p>

                    <div className="mt-7">
                      <p className="tag-mono mb-2 uppercase">
                        {t("promoLabel")}
                      </p>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="w-full cursor-pointer rounded-2xl border border-accent-line border-dashed bg-accent-soft px-5 py-4 text-center"
                      >
                        <span className="block font-medium font-mono text-[22px] text-accent tracking-[0.12em]">
                          {RATING_PROMO_CODE}
                        </span>
                        <span className="mt-1 block text-[12px] text-accent/70">
                          {copied ? t("promoCopied") : t("promoCopy")}
                        </span>
                      </button>
                    </div>

                    <div className="mt-8 flex justify-center">
                      <PillButton
                        variant="light"
                        href={locale === "fr" ? "/fr" : "/"}
                      >
                        {t("enter")}
                      </PillButton>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* ── The sealed envelope ── */
                <motion.div
                  key="envelope"
                  exit={{ opacity: 0, scale: 0.94, y: 10 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex flex-col items-center"
                >
                  <motion.button
                    type="button"
                    onClick={openLetter}
                    aria-label={t("hint")}
                    className="relative block aspect-[300/190] w-full cursor-pointer"
                    style={{ perspective: 1200 }}
                    animate={
                      reduce || breaking ? undefined : { scale: [1, 1.02, 1] }
                    }
                    transition={{
                      duration: 2.6,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {/* Envelope body. */}
                    <div className="absolute inset-0 rounded-[5px] border border-line-strong bg-panel2 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                      <svg
                        viewBox="0 0 300 190"
                        fill="none"
                        className="absolute inset-0 h-full w-full"
                        aria-hidden="true"
                      >
                        <g
                          className="stroke-line"
                          strokeWidth={1.25}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 184 L150 96" />
                          <path d="M294 184 L150 96" />
                        </g>
                      </svg>
                      <div className="pointer-events-none absolute inset-0 rounded-[5px] bg-gradient-to-b from-white/10 to-transparent" />
                    </div>

                    {/* The letter, peeking out as the flap lifts. */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-x-[7%] top-[12%] h-[70%] rounded-[3px] border border-line bg-panel"
                      initial={{ y: 0, opacity: 0 }}
                      animate={
                        breaking
                          ? { y: "-46%", opacity: 1 }
                          : { y: 0, opacity: 0 }
                      }
                      transition={{ duration: 0.55, ease: EASE, delay: 0.34 }}
                    />

                    {/* Flap — hinged on the top edge, swinging up and back. */}
                    <motion.div
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1/2 origin-top"
                      style={{ transformStyle: "preserve-3d" }}
                      initial={{ rotateX: 0 }}
                      animate={{ rotateX: breaking ? -168 : 0 }}
                      transition={{ duration: 0.7, ease: EASE, delay: 0.12 }}
                    >
                      <svg
                        viewBox="0 0 300 95"
                        fill="none"
                        className="h-full w-full"
                        aria-hidden="true"
                      >
                        <path
                          d="M0 0 L300 0 L150 95 Z"
                          className="fill-panel stroke-line"
                          strokeWidth={1.25}
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>

                    {/* Wax seal — two halves that snap apart as the flap lifts.
                        Each half is the shared seal, clipped down the middle. */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {([-1, 1] as const).map((side) => (
                        <motion.div
                          key={side}
                          aria-hidden
                          className="absolute h-20 w-20 drop-shadow-[0_2px_5px_rgba(0,0,0,0.2)]"
                          style={{
                            clipPath:
                              side === -1
                                ? "inset(0 50% 0 0)"
                                : "inset(0 0 0 50%)",
                          }}
                          initial={{ x: 0, rotate: 0, y: 0, opacity: 1 }}
                          animate={
                            breaking && !reduce
                              ? {
                                  x: side * 34,
                                  y: 26,
                                  rotate: side * 38,
                                  opacity: 0,
                                }
                              : { x: 0, y: 0, rotate: 0, opacity: 1 }
                          }
                          transition={{ duration: 0.5, ease: EASE }}
                        >
                          <WaxSeal
                            className="h-full w-full"
                            idSuffix={`-letter-${side === -1 ? "l" : "r"}`}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.button>

                  {/* Tap hint — pulses until it's been acted on. */}
                  <motion.span
                    className="tag-mono mt-6 uppercase"
                    animate={
                      reduce || breaking
                        ? { opacity: breaking ? 0 : 1 }
                        : { opacity: [0.35, 1, 0.35] }
                    }
                    transition={
                      reduce || breaking
                        ? { duration: 0.25 }
                        : {
                            duration: 2.2,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                          }
                    }
                  >
                    {t("hint")}
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
