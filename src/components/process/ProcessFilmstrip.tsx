"use client";

import { motion, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";
import { ProcessStage } from "./ProcessStage";
import { ProcessStepItem } from "./ProcessStepItem";

interface ProcessFilmstripProps {
  steps: ProcessStep[];
}

// Desktop presentation (md+): two-column scrollytelling. The left column holds
// a sticky "develop" stage; the right column is a tall list of steps. As each
// step crosses the viewport center it becomes active, swapping the stage image
// and lighting its own entry. A progress rail fills alongside, with a tick at
// each step.
export const ProcessFilmstrip = ({ steps }: ProcessFilmstripProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={sectionRef}
      className="mx-auto mt-10 hidden max-w-[1120px] grid-cols-12 gap-x-12 md:grid 2xl:max-w-[1360px]"
    >
      {/* Left — sticky develop stage, vertically centered in the viewport. */}
      <div className="col-span-6">
        <div className="sticky top-0 flex h-svh items-center">
          <ProcessStage steps={steps} activeIndex={activeIndex} />
        </div>
      </div>

      {/* Right — scrolling step index with a progress rail. */}
      <div className="relative col-span-6 pl-10">
        <div className="absolute top-0 left-0 h-full w-px bg-line">
          {/* Filled portion tracks scroll progress. */}
          <motion.div
            className="h-full w-px origin-top bg-accent"
            style={{ scaleY: scrollYProgress }}
          />

          {/* A tick sits at each step's vertical center, lighting up (dim →
              accent) once the fill above has reached it. */}
          {steps.map((step, index) => (
            <motion.span
              key={step.n}
              aria-hidden
              className="-translate-x-1/2 absolute left-1/2 h-1.5 w-1.5 rounded-full ring-2 ring-ink"
              style={{ top: `${((index + 0.5) / steps.length) * 100}%` }}
              initial={false}
              animate={{
                backgroundColor:
                  index <= activeIndex ? "var(--accent)" : "var(--line)",
              }}
              transition={{ duration: 0.4, ease: EASE }}
            />
          ))}
        </div>

        {steps.map((step, index) => (
          <ProcessStepItem
            key={step.n}
            step={step}
            index={index}
            isActive={activeIndex === index}
            onActivate={setActiveIndex}
          />
        ))}
      </div>
    </div>
  );
};
