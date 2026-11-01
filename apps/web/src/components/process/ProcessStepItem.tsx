"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ProcessBody } from "@/components/ProcessParts";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";

interface ProcessStepItemProps {
  step: ProcessStep;
  index: number;
  isActive: boolean;
  /** Fires when this block crosses the viewport center — drives the stage. */
  onActivate: (index: number) => void;
}

// One step in the scrolling right-hand column (desktop). A tall block so only
// one sits over the viewport center at a time; `useInView` with a centered
// margin reports that crossing to the parent, which lights this step up and
// swaps the sticky stage image. Inactive steps recede (dim + ghost numeral).
export const ProcessStepItem = ({
  step,
  index,
  isActive,
  onActivate,
}: ProcessStepItemProps) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  // A 1px-tall detection band pinned to the viewport middle.
  const inView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (inView) onActivate(index);
  }, [inView, index, onActivate]);

  return (
    <div ref={ref} className="flex min-h-[70vh] flex-col justify-center">
      <motion.div
        initial={false}
        animate={{ opacity: isActive ? 1 : 0.4 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <div className="flex items-baseline gap-5">
          <motion.span
            aria-hidden
            className="display text-5xl text-accent leading-none md:text-6xl"
            initial={false}
            animate={{
              opacity: reduce ? (isActive ? 1 : 0.35) : isActive ? 1 : 0.2,
            }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {step.n}
          </motion.span>
          <h3 className="font-semibold text-2xl tracking-tight md:text-3xl">
            {step.title}
          </h3>
        </div>

        <div className="mt-6 md:pl-[calc(3rem+1.25rem)]">
          <ProcessBody step={step} maxW="max-w-[440px]" active={isActive} />
        </div>
      </motion.div>
    </div>
  );
};
