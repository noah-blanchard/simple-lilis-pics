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

// Two irregular strokes that read as an ink underline drawn by hand: several
// uneven bumps (not one clean bow), a baseline that drifts up and down, and a
// faint "second pass" that lands a hair off the first — the way a real pen
// re-traces a line. preserveAspectRatio="none" stretches them to the word width;
// both sit low in the viewBox so they clear descenders (p, g, j…). The wrapper
// gets a tiny tilt so the whole mark isn't mechanically level.
const PATH_MAIN =
  "M1.6,6.7 C13,4.1 24,8.7 37,6.3 C49,4.3 61,8.9 74,6.1 C82,4.6 90,7 98.4,6.4";
const PATH_GHOST =
  "M2.6,7.7 C14,5.7 25,9.5 39,7.1 C52,5.3 64,9 76,7.2 C84,6.1 91,7.9 97.4,7.3";

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
          className="pointer-events-none absolute inset-x-0 top-full h-[0.36em] w-full overflow-visible"
          style={{ transform: "rotate(-0.7deg)" }}
        >
          <motion.path
            d={PATH_MAIN}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.6}
            strokeWidth={2.1}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: reduce ? 0 : 0.9,
              ease: EASE,
              delay: reduce ? 0 : delay,
            }}
          />
          {/* Fainter, thinner second pass — offset a touch and drawn slightly
              later, like a pen re-tracing the line. */}
          <motion.path
            d={PATH_GHOST}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1.3}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: reduce ? 1 : 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: reduce ? 0 : 1,
              ease: EASE,
              delay: reduce ? 0 : delay + 0.12,
            }}
          />
        </svg>
      </span>
    </span>
  );
};
