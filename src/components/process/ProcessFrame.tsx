"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { ProcessBody } from "@/components/ProcessParts";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";

interface ProcessFrameProps {
  step: ProcessStep;
  /** True for every frame except the last — draws the connecting rail down. */
  connect: boolean;
}

// Mobile presentation: the filmstrip unrolled. Each step is a frame threaded
// on a hairline rail (a strip of film). The image reveals in on scroll —
// blur → sharp, echoing the desktop stage. No pinning; phones scrub sticky
// layouts poorly, so this just reveals top-to-bottom.
export const ProcessFrame = ({ step, connect }: ProcessFrameProps) => {
  const reduce = useReducedMotion();

  return (
    <div className="relative pl-8">
      {/* Filmstrip rail + node. */}
      <span
        aria-hidden
        className="absolute top-2 left-[3px] h-2.5 w-2.5 rounded-full bg-accent"
      />
      {connect && (
        <span
          aria-hidden
          className="absolute top-6 bottom-[-2rem] left-[7px] w-px bg-line"
        />
      )}

      <div className="flex items-baseline gap-4">
        <span aria-hidden className="display text-4xl text-accent leading-none">
          {step.n}
        </span>
        <h3 className="font-semibold text-2xl tracking-tight">{step.title}</h3>
      </div>

      <motion.div
        className="relative mt-5 aspect-[4/5] w-full overflow-hidden rounded-card"
        initial={
          reduce
            ? { opacity: 0 }
            : { opacity: 0, scale: 1.04, filter: "blur(14px) brightness(0.6)" }
        }
        whileInView={
          reduce
            ? { opacity: 1 }
            : { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)" }
        }
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <Image
          src={step.img}
          alt={step.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      <div className="mt-6">
        <ProcessBody step={step} maxW="max-w-[440px]" />
      </div>
    </div>
  );
};
