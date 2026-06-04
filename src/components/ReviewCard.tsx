"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import type { Review } from "@/types";
import { IconQuote } from "./Icons";

interface ReviewCardProps {
  review: Review;
}

// Hover-driven via motion/react variant propagation (no CSS hover/transitions).
// Colours come from Tailwind classes (so they flip with the theme); motion only
// animates transforms/opacity. The hover surface (panel → panel-2) is an opacity
// overlay and the quote glyph cross-fades between two colour layers.
const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const cardVariants: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 0px rgba(74,124,255,0)" },
  hover: { y: -6, boxShadow: "0 0 0 1.5px rgba(74,124,255,1)" },
};
const fadeIn: Variants = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const fadeOut: Variants = { rest: { opacity: 1 }, hover: { opacity: 0 } };

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    animate="rest"
    variants={cardVariants}
    transition={transition}
    className="relative flex w-[300px] shrink-0 flex-col justify-between rounded-card bg-panel p-7 md:w-[380px] md:p-8"
  >
    {/* hover surface (panel → panel-2) */}
    <motion.span
      aria-hidden
      variants={fadeIn}
      transition={transition}
      className="absolute inset-0 rounded-card bg-panel2"
    />

    {/* quote glyph — cross-fades fg → accent on hover */}
    <span className="relative z-10 mb-6 block h-9 w-9">
      <motion.span
        aria-hidden
        variants={fadeOut}
        transition={transition}
        className="absolute inset-0 text-fg"
      >
        <IconQuote className="h-9 w-9" />
      </motion.span>
      <motion.span
        aria-hidden
        variants={fadeIn}
        transition={transition}
        className="absolute inset-0 text-accent"
      >
        <IconQuote className="h-9 w-9" />
      </motion.span>
    </span>

    <p className="relative z-10 text-[15px] text-fg/85 leading-relaxed md:text-[16px]">
      &ldquo;{review.quote}&rdquo;
    </p>
    <div className="relative z-10 mt-8 flex items-center gap-4 border-line border-t pt-6">
      <Image
        src={review.avatar}
        alt={review.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div>
        <div className="font-semibold">{review.name}</div>
        <div className="text-[13px] text-fg/55">{review.role}</div>
      </div>
    </div>
  </motion.div>
);
