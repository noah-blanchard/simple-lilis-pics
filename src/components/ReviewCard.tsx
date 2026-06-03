"use client";

import { motion, type Variants } from "motion/react";
import Image from "next/image";
import type { Review } from "@/types";
import { IconQuote } from "./Icons";

interface ReviewCardProps {
  review: Review;
}

// Hover-driven via motion/react variant propagation (no CSS hover/transitions).
// The accent outline uses boxShadow (not a border) so layout never shifts — the
// card stays byte-identical at rest, including in the untouched mobile carousel.
const transition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] } as const;

const cardVariants: Variants = {
  rest: {
    y: 0,
    backgroundColor: "#141414",
    boxShadow: "0 0 0 0px rgba(245,225,85,0)",
  },
  hover: {
    y: -6,
    backgroundColor: "#1c1c1c",
    boxShadow: "0 0 0 1.5px rgba(245,225,85,1)",
  },
};

const iconVariants: Variants = {
  rest: { color: "#fafafa" },
  hover: { color: "#f5e155" },
};

export const ReviewCard = ({ review }: ReviewCardProps) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    animate="rest"
    variants={cardVariants}
    transition={transition}
    className="flex w-[300px] shrink-0 flex-col justify-between rounded-card p-7 md:w-[380px] md:p-8"
  >
    <motion.span
      variants={iconVariants}
      transition={transition}
      className="mb-6 block"
    >
      <IconQuote className="h-9 w-9" />
    </motion.span>
    <p className="text-[15px] text-white/85 leading-relaxed md:text-[16px]">
      &ldquo;{review.quote}&rdquo;
    </p>
    <div className="mt-8 flex items-center gap-4 border-line border-t pt-6">
      <Image
        src={review.avatar}
        alt={review.name}
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      <div>
        <div className="font-semibold">{review.name}</div>
        <div className="text-[13px] text-white/55">{review.role}</div>
      </div>
    </div>
  </motion.div>
);
