"use client";

import {
  type MotionValue,
  motion,
  useReducedMotion,
  useTransform,
} from "motion/react";
import type { ProcessStep } from "@/types";
import { RoundedImage } from "./RoundedImage";

interface ProcessCardProps {
  step: ProcessStep;
  index: number;
  total: number;
  /** Section scroll progress: 0 at the first card, 1 at the last. */
  progress: MotionValue<number>;
  /** Collapsed-header height in px — also the sticky `top` stagger between cards. */
  headerH: number;
}

// How many cards can recede behind the active one before depth maxes out.
const DEPTH_LIMIT = 3;

// Scroll-driven stacking card. Layout (the stacking itself) is pure CSS
// `position: sticky`: card i pins at `i * headerH`, so once card i+1 pins just
// below it the previous card is covered down to its header strip — the new card
// "se superpose par-dessus" and the old one "se replie" into the pile of headers.
// motion/react only drives the *animated* depth cues (scale recede + dim).
export const ProcessCard = ({
  step,
  index,
  total,
  progress,
  headerH,
}: ProcessCardProps) => {
  const reduce = useReducedMotion();

  // Distance (in cards) the active position has advanced past this card.
  const depth = useTransform(progress, (p) => {
    const d = p * (total - 1) - index;
    return Math.min(Math.max(d, 0), DEPTH_LIMIT);
  });
  const scale = useTransform(depth, [0, DEPTH_LIMIT], [1, 0.94]);
  const dim = useTransform(depth, [0, 1], [0, 0.4]);

  return (
    <motion.div
      style={{
        top: `${index * headerH}px`,
        zIndex: index + 1,
        scale: reduce ? 1 : scale,
        transformOrigin: "top center",
      }}
      className="sticky overflow-hidden rounded-card bg-panel"
    >
      {/* Header — always visible; becomes the collapsed strip once covered. */}
      <div
        className="flex items-center gap-5 px-6 md:gap-7 md:px-8"
        style={{ height: `${headerH}px` }}
      >
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-semibold text-[15px] text-ink">
          {step.n}
        </span>
        <span className="truncate font-semibold text-2xl tracking-tight md:text-3xl">
          {step.title}
        </span>
      </div>

      {/* Body — read while the card is current, hidden behind the next once covered. */}
      <div className="grid grid-cols-12 gap-8 px-6 pb-10 md:px-8">
        <div className="col-span-5">
          <RoundedImage
            src={step.img}
            alt={step.title}
            ratio="aspect-[4/5]"
            sizes="(max-width: 1024px) 40vw, 420px"
          />
        </div>
        <div className="col-span-7 flex flex-col justify-center">
          <p className="max-w-[460px] text-[15px] text-white/80 leading-relaxed md:text-[16px]">
            {step.body}
          </p>
          <ul className="mt-6 space-y-2 text-[14px] text-white/65">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="text-accent">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Depth dim — covered cards recede into the pile. */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: dim }}
        />
      )}
    </motion.div>
  );
};
