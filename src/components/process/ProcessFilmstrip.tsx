"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import type { ProcessStep } from "@/types";
import { ProcessStage } from "./ProcessStage";
import { ProcessStepItem } from "./ProcessStepItem";

interface ProcessFilmstripProps {
  steps: ProcessStep[];
}

// Desktop presentation (md+): two-column scrollytelling. The left column holds
// a sticky "develop" stage; the right column is a tall list of steps. As each
// step crosses the viewport center it becomes active, swapping the stage image
// and lighting its own entry. A progress rail fills alongside, with a glowing
// node that rides the scroll position past a tick for each step.
export const ProcessFilmstrip = ({ steps }: ProcessFilmstripProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const nodeTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div
      ref={sectionRef}
      className="mx-auto mt-10 hidden max-w-[1120px] grid-cols-12 gap-x-12 md:grid"
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

          {/* A tick sits at each step's vertical center. */}
          {steps.map((step, index) => (
            <span
              key={step.n}
              aria-hidden
              className="-translate-x-1/2 absolute left-1/2 h-1.5 w-1.5 rounded-full bg-line ring-2 ring-ink"
              style={{ top: `${((index + 0.5) / steps.length) * 100}%` }}
            />
          ))}

          {/* Glowing node riding the scroll position. Driven via `y` (a
              transform, GPU-compositable) rather than `top` (a layout
              property) — animating `top` forces layout+paint on every
              scroll tick, which is cheap enough to hide on Windows' lower-
              frequency wheel events but visibly stutters on macOS, where
              trackpad momentum scrolling fires far more often. The wrapper
              is full-height so the "0%"-"100%" motion value still resolves
              against the whole rail, matching the old `top` behavior. */}
          <motion.div
            aria-hidden
            className="absolute top-0 left-1/2 h-full"
            style={{ y: nodeTop }}
          >
            <span className="-translate-x-1/2 -translate-y-1/2 absolute top-0 block h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_2px_var(--accent)] ring-4 ring-ink" />
          </motion.div>
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
