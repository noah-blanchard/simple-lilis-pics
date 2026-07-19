"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

interface FocusBracketsProps {
  /** Re-keys the pulse so the brackets "re-focus" each time the step changes. */
  activeIndex: number;
}

// Signature element: four accent corner-brackets, like a camera viewfinder's
// focus frame. They snap-pulse inward whenever the active step changes, and a
// small center reticle flashes once — the stage image "coming into focus".
// Purely decorative (aria-hidden); the develop reveal does the real telling.
const CORNERS = [
  "top-4 left-4 border-t-2 border-l-2 rounded-tl-md",
  "top-4 right-4 border-t-2 border-r-2 rounded-tr-md",
  "bottom-4 left-4 border-b-2 border-l-2 rounded-bl-md",
  "bottom-4 right-4 border-b-2 border-r-2 rounded-br-md",
] as const;

export const FocusBrackets = ({ activeIndex }: FocusBracketsProps) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      // Remount on step change to replay the focus pulse.
      key={reduce ? "static" : activeIndex}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      initial={reduce ? false : { scale: 1.06, opacity: 0.35 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {CORNERS.map((corner) => (
        <span
          key={corner}
          className={`absolute h-9 w-9 border-accent/80 ${corner}`}
        />
      ))}

      {/* Center reticle — flashes and contracts as focus confirms, then fades. */}
      {!reduce && (
        <motion.span
          className="absolute top-1/2 left-1/2 block h-5 w-5"
          style={{ x: "-50%", y: "-50%" }}
          initial={{ opacity: 0.9, scale: 1.6 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        >
          <span className="-translate-x-1/2 absolute top-0 left-1/2 h-full w-px bg-accent" />
          <span className="-translate-y-1/2 absolute top-1/2 left-0 h-px w-full bg-accent" />
        </motion.span>
      )}
    </motion.div>
  );
};
