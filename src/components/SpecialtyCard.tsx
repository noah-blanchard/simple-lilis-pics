"use client";

import { motion, type Variants } from "motion/react";
import type { Specialty } from "@/types";
import { CatIcon } from "./Icons";

interface SpecialtyCardProps {
  specialty: Specialty;
}

// Hover-driven, fully presentational. Colours are Tailwind classes (so they flip
// with the theme); motion only animates transforms + opacity. The card surface
// (panel → accent) is an opacity overlay and the text recolours by cross-fading
// two identical content layers — motion never owns a theme-dependent colour.
const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const cardVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.04, rotate: -1.5 },
};
const fadeIn: Variants = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const fadeOut: Variants = { rest: { opacity: 1 }, hover: { opacity: 0 } };

export const SpecialtyCard = ({ specialty }: SpecialtyCardProps) => {
  // One content layer; rendered twice with different colour classes.
  const layer = (textClass: string, descClass: string) => (
    <div className="absolute inset-0 flex flex-col justify-between p-7 text-left">
      <div className="flex justify-end">
        <CatIcon kind={specialty.id} className={`h-9 w-9 ${textClass}`} />
      </div>
      <div>
        <div
          className={`mb-2 font-semibold text-2xl tracking-tight md:text-[28px] ${textClass}`}
        >
          {specialty.title}
        </div>
        <p className={`text-[13px] leading-snug ${descClass}`}>
          {specialty.desc}
        </p>
      </div>
    </div>
  );

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
      transition={transition}
      className="relative aspect-square w-full overflow-hidden rounded-card bg-panel"
    >
      {/* accent surface on hover */}
      <motion.span
        aria-hidden
        variants={fadeIn}
        transition={transition}
        className="absolute inset-0 bg-accent"
      />

      {/* rest content (fades out) */}
      <motion.div variants={fadeOut} transition={transition}>
        {layer("text-fg", "text-muted")}
      </motion.div>

      {/* hover content (fades in) — hidden from AT to avoid duplicate reading */}
      <motion.div aria-hidden variants={fadeIn} transition={transition}>
        {layer("text-on-accent", "text-on-accent")}
      </motion.div>
    </motion.div>
  );
};
