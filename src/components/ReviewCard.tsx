"use client";

import { motion, type Variants } from "motion/react";
import { StarIcon } from "@/components/rate/StarIcon";
import { EASE } from "@/lib/motion";
import type { ResolvedRating } from "@/types/db";
import { IconQuote } from "./Icons";

interface ReviewCardProps {
  review: ResolvedRating;
  /** Localized label for a rating left without a name. */
  anonymousLabel: string;
}

// Hover-driven via motion/react variant propagation (no CSS hover/transitions).
// Colours come from Tailwind classes (so they flip with the theme); motion only
// animates transforms/opacity. The hover surface (panel → panel-2) is an opacity
// overlay and the quote glyph cross-fades between two colour layers.
const transition = { duration: 0.3, ease: EASE } as const;

// Both endpoints reference the accent token so the hover ring flips with the
// theme; only the ring spread animates (0px → 1.5px), so the resting state is
// invisible regardless of colour.
const cardVariants: Variants = {
  rest: { y: 0, boxShadow: "0 0 0 0px var(--accent)" },
  hover: { y: -6, boxShadow: "0 0 0 1.5px var(--accent)" },
};
const fadeIn: Variants = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const fadeOut: Variants = { rest: { opacity: 1 }, hover: { opacity: 0 } };

const STARS = [1, 2, 3, 4, 5];

export const ReviewCard = ({ review, anonymousLabel }: ReviewCardProps) => (
  <motion.div
    initial="rest"
    whileHover="hover"
    animate="rest"
    variants={cardVariants}
    transition={transition}
    className="relative flex w-[300px] shrink-0 flex-col justify-between rounded-card bg-panel p-7 md:w-[300px] md:p-8 lg:w-[340px] xl:w-[380px] 2xl:w-[420px]"
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

    <p className="relative z-10 text-[15px] text-fg/85 leading-relaxed md:text-[16px] min-[1440px]:text-body-fluid">
      &ldquo;{review.note}&rdquo;
    </p>

    <div className="relative z-10 mt-8 flex items-center gap-4 border-line border-t pt-6">
      {/* Monogram in place of a photo — these come from strangers on the
          street, so there is no avatar to show and inventing one would be a
          lie about who left the review. */}
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-[16px] text-accent">
        {review.initials ?? <StarIcon className="h-5 w-5 text-accent" filled />}
      </span>
      <div className="min-w-0">
        <div className="truncate font-semibold">
          {review.name ?? anonymousLabel}
        </div>
        <span
          className="mt-1 flex gap-0.5"
          role="img"
          aria-label={`${review.stars} / 5`}
        >
          {STARS.map((star) => (
            <span
              key={star}
              className={star <= review.stars ? "text-accent" : "text-line"}
            >
              <StarIcon className="h-3.5 w-3.5" filled={star <= review.stars} />
            </span>
          ))}
        </span>
      </div>
    </div>
  </motion.div>
);
