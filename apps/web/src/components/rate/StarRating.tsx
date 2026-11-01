"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { EASE } from "@/lib/motion";
import { StarIcon } from "./StarIcon";

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

/** Short, dry tick when a new star is crossed. Absent on iOS Safari, which is
 *  fine — it's an enhancement, never the feedback itself. */
function tick() {
  navigator.vibrate?.(8);
}

/**
 * The whole reason this page exists. Five stars that can be tapped *or* swiped
 * across like an iOS rating — drag right to fill, drag back to un-fill — with
 * the filled stars landing in a left-to-right cascade rather than all at once,
 * and a burst of light under the star your finger just crossed.
 *
 * Motion owns transforms and opacity only; the two colour states are separate
 * cross-faded layers, per the PillButton/ReviewCard convention (motion drops
 * `var()` colours).
 */
export const StarRating = ({ value, onChange }: StarRatingProps) => {
  const t = useTranslations("rate.stars");
  const reduce = useReducedMotion();
  const rowRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  // The star that most recently lit up — the burst plays on that one only, so
  // sweeping across five stars reads as five distinct impacts.
  const [burstAt, setBurstAt] = useState(0);

  const setValue = useCallback(
    (next: number) => {
      if (next === value) return;
      if (next > value) {
        setBurstAt(next);
        tick();
      }
      onChange(next);
    },
    [value, onChange],
  );

  /** Map a pointer x-position onto a star index, so one swipe sets the rating. */
  const valueFromPointer = useCallback((clientX: number) => {
    const row = rowRef.current;
    if (!row) return 0;
    const { left, width } = row.getBoundingClientRect();
    const ratio = (clientX - left) / width;
    return Math.min(STARS.length, Math.max(1, Math.ceil(ratio * STARS.length)));
  }, []);

  const handlePointerDown = (event: React.PointerEvent) => {
    dragging.current = true;
    // Keep receiving moves even when the finger leaves the row.
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setValue(valueFromPointer(event.clientX));
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!dragging.current) return;
    setValue(valueFromPointer(event.clientX));
  };

  const endDrag = () => {
    dragging.current = false;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      setValue(Math.min(STARS.length, value + 1));
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(Math.max(1, value - 1));
    }
  };

  return (
    <div className="w-full">
      <div
        ref={rowRef}
        role="radiogroup"
        aria-label={t("label")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        className="flex touch-none select-none items-center justify-between gap-1"
      >
        {STARS.map((star, index) => {
          const isFilled = star <= value;
          // Stagger only when the whole row lights up at once (a swipe or a tap
          // on star 5); a correction from 4→3 shouldn't re-cascade.
          const delay = reduce ? 0 : Math.max(0, index - (burstAt - 1)) * 0.045;

          return (
            // A real <input type="radio"> can't be swiped across: the pointer drag
            // that sets the rating in one gesture needs plain buttons. The roles
            // and the arrow-key handler keep it equivalent for assistive tech.
            // biome-ignore lint/a11y/useSemanticElements: swipe-to-rate needs a button
            <motion.button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === value}
              aria-label={t("starLabel", { count: star })}
              tabIndex={star === value || (value === 0 && star === 1) ? 0 : -1}
              onClick={() => setValue(star)}
              className="relative flex h-[68px] flex-1 cursor-pointer items-center justify-center"
              whileTap={reduce ? undefined : { scale: 0.92 }}
            >
              {/* Impact burst — the glow + ripple pair from the contact-form
                  wax seal, scaled down to a fingertip. */}
              {!reduce && burstAt === star && isFilled && (
                <>
                  <motion.span
                    key={`glow-${value}`}
                    aria-hidden
                    className="pointer-events-none absolute h-16 w-16 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, color-mix(in srgb, var(--accent) 55%, transparent) 0%, transparent 70%)",
                    }}
                    initial={{ scale: 0.6, opacity: 0.55 }}
                    animate={{ scale: 1.9, opacity: 0 }}
                    transition={{ duration: 0.7, ease: EASE }}
                  />
                  <motion.span
                    key={`ring-${value}`}
                    aria-hidden
                    className="pointer-events-none absolute h-14 w-14 rounded-full border border-accent"
                    initial={{ scale: 0.75, opacity: 0.6 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </>
              )}

              <motion.span
                className="relative block h-11 w-11"
                animate={
                  reduce
                    ? undefined
                    : { scale: isFilled ? 1 : 0.88, rotate: isFilled ? 0 : -8 }
                }
                transition={{
                  scale: { type: "spring", stiffness: 520, damping: 15, delay },
                  rotate: {
                    type: "spring",
                    stiffness: 300,
                    damping: 13,
                    delay,
                  },
                }}
              >
                {/* Empty state — a hairline outline. */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 text-line-strong"
                  animate={{ opacity: isFilled ? 0 : 1 }}
                  transition={{ duration: 0.2, ease: EASE, delay }}
                >
                  <StarIcon className="h-full w-full" filled={false} />
                </motion.span>
                {/* Filled state — solid brass. */}
                <motion.span
                  aria-hidden
                  className="absolute inset-0 text-accent"
                  animate={{ opacity: isFilled ? 1 : 0 }}
                  transition={{ duration: 0.2, ease: EASE, delay }}
                >
                  <StarIcon className="h-full w-full" filled />
                </motion.span>
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      {/* Caption gives the number weight — it swaps per value rather than
          fading in once. */}
      <div className="mt-4 flex h-6 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {value > 0 && (
            <motion.p
              key={value}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="text-[15px] text-fg/70"
            >
              {t(`captions.${value}`)}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
