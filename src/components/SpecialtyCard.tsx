"use client";

import { motion, type Variants } from "motion/react";
import type { Specialty } from "@/types";
import { CatIcon } from "./Icons";

interface SpecialtyCardProps {
  specialty: Specialty;
}

// Hover-driven, fully presentational. All hover animation runs through
// motion/react variant propagation: the root's active "hover" label cascades
// to the child motion elements, so every colour animates in sync (no CSS hover).
const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const cardVariants: Variants = {
  rest: { scale: 1, rotate: 0, backgroundColor: "#141414" },
  hover: { scale: 1.04, rotate: -1.5, backgroundColor: "#f5e155" },
};

const inkVariants: Variants = {
  rest: { color: "#fafafa" },
  hover: { color: "#0a0a0a" },
};

const descVariants: Variants = {
  rest: { color: "rgba(250,250,250,0.55)" },
  hover: { color: "rgba(10,10,10,0.7)" },
};

export const SpecialtyCard = ({ specialty }: SpecialtyCardProps) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    animate="rest"
    variants={cardVariants}
    transition={transition}
    className="flex aspect-square w-full flex-col justify-between rounded-card p-7 text-left"
  >
    <div className="flex justify-end">
      <motion.span variants={inkVariants} transition={transition}>
        <CatIcon kind={specialty.id} className="h-9 w-9" />
      </motion.span>
    </div>
    <div>
      <motion.div
        variants={inkVariants}
        transition={transition}
        className="mb-2 font-semibold text-2xl tracking-tight md:text-[28px]"
      >
        {specialty.title}
      </motion.div>
      <motion.p
        variants={descVariants}
        transition={transition}
        className="text-[13px] leading-snug"
      >
        {specialty.desc}
      </motion.p>
    </div>
  </motion.div>
);
