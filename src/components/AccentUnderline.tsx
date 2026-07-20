"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

interface AccentUnderlineProps {
  children: ReactNode;
  /** Color/style classes for the wrapped text (e.g. "text-accent italic"). */
  className?: string;
  /** Force the word onto its own headline line (still shrink-wraps the text). */
  block?: boolean;
  /** Delay before the stroke starts revealing, once scrolled into view. */
  delay?: number;
}

// One continuous stroke with an off-center control point, so it reads as a
// single underline with a slight natural bow rather than a straight ruler
// line. preserveAspectRatio="none" stretches it to the word's width. It sits
// in the lower part of the viewBox so it clears the descenders (p, g, j…).
const PATH = "M1,7 Q40,3 99,6";

/**
 * Wraps an accented headline word/phrase with a scroll-drawn, hand-inked
 * underline (skip on the Hero title — it's excluded by design). Stroke color
 * follows `currentColor`, so pair it with a `text-accent` className.
 *
 * The line draws itself via `pathLength` (0 → 1) on scroll-into-view. Note the
 * deliberate absence of `vectorEffect="non-scaling-stroke"`: that flag makes
 * the stroke-dasharray behind `pathLength` ignore the non-uniform stretch here
 * and renders the draw as a broken/dashed line. Without it the line stays one
 * continuous stroke (thickness just scales with the box, which is fine).
 *
 * The inner span is always `inline-block` so it shrink-wraps the text and the
 * underline matches the word width exactly; `block` only controls whether the
 * word sits on its own line (the parent's text-align keeps it centered).
 */
export const AccentUnderline = ({
  children,
  className = "",
  block = false,
  delay = 0.25,
}: AccentUnderlineProps) => {
  const reduce = useReducedMotion();

  return (
    <span className={block ? "block" : "inline"}>
      <span className={`relative inline-block ${className}`}>
        {children}
        <svg
          aria-hidden="true"
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-full h-[0.32em] w-full overflow-visible"
        >
          <motion.path
            d={PATH}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.55}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: reduce ? 0 : 0.9,
              ease: EASE,
              delay: reduce ? 0 : delay,
            }}
          />
        </svg>
      </span>
    </span>
  );
};
