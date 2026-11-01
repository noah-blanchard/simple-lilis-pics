"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";

const listV: Variants = {
  hide: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
};
const itemV: Variants = {
  hide: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};
const dashV: Variants = {
  hide: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.4, ease: EASE, delay: 0.12 } },
};

/** Bulleted list where each row slides in and its accent dash draws outward.
 *  Desktop passes `active` (the parent step's centered state) to drive the
 *  reveal; mobile omits it and reveals on scroll into view. */
export const ProcessBullets = ({
  items,
  active,
}: {
  items: string[];
  active?: boolean;
}) => {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <ul className="mt-6 space-y-2.5 text-[14px] text-fg/65">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2.5 h-px w-4 shrink-0 bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  // Controlled by `active` (desktop) or by scroll-into-view (mobile).
  const activation =
    active === undefined
      ? ({
          whileInView: "show",
          viewport: { once: true, margin: "-60px" },
        } as const)
      : ({ animate: active ? "show" : "hide" } as const);

  return (
    <motion.ul
      initial="hide"
      variants={listV}
      {...activation}
      className="mt-6 space-y-2.5 text-[14px] text-fg/65"
    >
      {items.map((item) => (
        <motion.li key={item} variants={itemV} className="flex gap-3">
          <motion.span
            variants={dashV}
            className="mt-2.5 h-px w-4 shrink-0 origin-left bg-accent"
          />
          <span>{item}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
};

/** Body paragraph + bullet list — shared by the desktop step index
 *  (ProcessStepItem) and the mobile frame (ProcessFrame). `maxW` tunes the
 *  paragraph width; `active` forwards the desktop centered-state to the list. */
export const ProcessBody = ({
  step,
  maxW = "max-w-[460px]",
  active,
}: {
  step: ProcessStep;
  maxW?: string;
  active?: boolean;
}) => (
  <>
    <p
      className={`${maxW} text-[15px] text-fg/80 leading-relaxed md:text-[16px]`}
    >
      {step.body}
    </p>
    <ProcessBullets items={step.bullets} active={active} />
  </>
);
