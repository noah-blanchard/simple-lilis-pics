"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE } from "@/lib/motion";

interface AccentUnderlineProps {
  children: string;
  /** Color/style classes for the wrapped text (e.g. "text-accent italic"). */
  className?: string;
  /** Force the phrase onto its own headline line. */
  block?: boolean;
  /** Delay before the first letter lights up, once scrolled into view. */
  delay?: number;
}

const STAGGER = 0.032;

const container: Variants = {
  hidden: {},
  visible: (startDelay: number) => ({
    transition: { staggerChildren: STAGGER, delayChildren: startDelay },
  }),
};

const letter: Variants = {
  hidden: { color: "var(--muted)", textShadow: "0 0 0px transparent" },
  visible: {
    color: "var(--accent)",
    textShadow: [
      "0 0 0px transparent",
      "0 0 10px color-mix(in srgb, var(--accent) 70%, transparent)",
      "0 0 0px transparent",
    ],
    transition: {
      color: { duration: 0.3, ease: EASE },
      textShadow: { duration: 0.6, ease: EASE, times: [0, 0.35, 1] },
    },
  },
};

/**
 * Wraps an accented headline word/phrase so it lights up letter by letter on
 * scroll-into-view: each character eases from a muted tone to the accent
 * color with a brief glow pulse, then settles (skip on the Hero title — it's
 * excluded by design).
 */
export const AccentUnderline = ({
  children,
  className = "",
  block = false,
  delay = 0.15,
}: AccentUnderlineProps) => {
  const reduce = useReducedMotion();
  const words = children.split(" ");

  if (reduce) {
    return (
      <span className={block ? "block" : "inline"}>
        <span className={className} style={{ color: "var(--accent)" }}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <motion.span
      className={`${block ? "block" : "inline"} ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
    >
      {words.flatMap((word, wi) => [
        wi > 0 ? <span key={`sp-${wi}`}> </span> : null,
        <span key={`w-${wi}`} className="inline-block">
          {Array.from(word).map((ch, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              variants={letter}
              className="inline-block"
            >
              {ch}
            </motion.span>
          ))}
        </span>,
      ])}
    </motion.span>
  );
};
