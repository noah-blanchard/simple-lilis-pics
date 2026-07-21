"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";

interface ProcessStageProps {
  steps: ProcessStep[];
  /** Index of the step currently centered in the scrolling column. */
  activeIndex: number;
}

// The sticky stage (desktop). All step images stay mounted and stacked; the
// active one reveals in sharp and lit while the rest fade out blurred/dim.
export const ProcessStage = ({ steps, activeIndex }: ProcessStageProps) => {
  const reduce = useReducedMotion();

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card">
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <motion.div
            key={step.n}
            className="absolute inset-0"
            initial={false}
            animate={
              reduce
                ? { opacity: active ? 1 : 0 }
                : {
                    opacity: active ? 1 : 0,
                    filter: active
                      ? "blur(0px) brightness(1)"
                      : "blur(14px) brightness(0.55)",
                  }
            }
            transition={{ duration: 0.7, ease: EASE }}
          >
            <Image
              src={step.img}
              alt={step.title}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
};
