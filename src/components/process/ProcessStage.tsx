"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { EASE } from "@/lib/motion";
import type { ProcessStep } from "@/types";
import { FocusBrackets } from "./FocusBrackets";

interface ProcessStageProps {
  steps: ProcessStep[];
  /** Index of the step currently centered in the scrolling column. */
  activeIndex: number;
}

const pad = (n: number) => String(n).padStart(2, "0");

// The sticky "develop" stage (desktop). All step images stay mounted and
// stacked; the active one is lit and sharp while the rest fade out. When a
// step becomes active its image develops in like a darkroom print
// (blur → sharp, dim → lit), a band of light sweeps across, and it drifts in a
// slow Ken Burns pan while you read. motion/react drives everything;
// reduced-motion collapses it to a plain opacity cross-fade.
export const ProcessStage = ({ steps, activeIndex }: ProcessStageProps) => {
  const reduce = useReducedMotion();

  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-panel">
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
            {/* Ken Burns layer — a slow pan/zoom while this step is active. */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={
                !reduce && active
                  ? { scale: [1.03, 1.1], x: [0, -12], y: [0, -8] }
                  : { scale: reduce ? 1 : 1.03, x: 0, y: 0 }
              }
              transition={
                active
                  ? { duration: 9, ease: "linear" }
                  : { duration: 0.6, ease: EASE }
              }
            >
              <Image
                src={step.img}
                alt={step.title}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </motion.div>

            {/* Develop sweep — a bar of light passes once as focus lands. */}
            {!reduce && active && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                  key={activeIndex}
                  className="h-full w-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent"
                  style={{ skewX: -12 }}
                  initial={{ x: "-160%" }}
                  animate={{ x: "260%" }}
                  transition={{ duration: 1, ease: EASE, delay: 0.1 }}
                />
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Edge vignette + film grain — legibility and darkroom texture. */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/45 via-transparent to-ink/20" />
      <div className="grain pointer-events-none absolute inset-0 opacity-70" />

      <FocusBrackets activeIndex={activeIndex} />

      {/* Frame counter HUD — a photographer counting frames. */}
      <div className="absolute top-6 left-6 inline-flex items-center gap-1.5 rounded-full bg-ink/55 px-3 py-1.5 font-mono text-[12px] text-fg backdrop-blur-sm">
        <span className="tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={activeIndex}
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {pad(activeIndex + 1)}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="text-fg/45">/ {pad(steps.length)}</span>
      </div>
    </div>
  );
};
