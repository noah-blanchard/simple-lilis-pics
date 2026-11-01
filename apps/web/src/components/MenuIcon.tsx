"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/motion";

interface MenuIconProps {
  open: boolean;
  className?: string;
}

// Two strokes that morph between a hamburger and an X. Each line is centred at
// y=12 and pushed apart by a translateY when closed; opening pulls them together
// and rotates them ±45° into a cross. All motion via motion/react.
export const MenuIcon = ({ open, className = "" }: MenuIconProps) => {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : { duration: 0.4, ease: EASE };

  const lineStyle = {
    transformBox: "fill-box" as const,
    transformOrigin: "center",
  };

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <motion.line
        x1="3"
        x2="21"
        y1="12"
        y2="12"
        style={lineStyle}
        initial={false}
        animate={open ? { y: 0, rotate: 45 } : { y: -4, rotate: 0 }}
        transition={transition}
      />
      <motion.line
        x1="3"
        x2="21"
        y1="12"
        y2="12"
        style={lineStyle}
        initial={false}
        animate={open ? { y: 0, rotate: -45 } : { y: 4, rotate: 0 }}
        transition={transition}
      />
    </svg>
  );
};
