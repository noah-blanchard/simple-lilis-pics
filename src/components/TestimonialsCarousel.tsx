"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRef, useState } from "react";
import type { Review } from "@/types";
import { ReviewCard } from "./ReviewCard";

interface TestimonialsCarouselProps {
  items: Review[];
  direction?: "left" | "right";
}

// Copies of the set rendered end-to-end; wrapping x by one copy's width loops
// seamlessly (one copy stays narrower than total minus the viewport).
const REPEAT = 3;
// Scroll speed in px/second.
const SPEED = 40;

// Infinite marquee driven entirely by motion/react: a single motion value is
// advanced each frame and wrapped within one copy's width. Hovering pauses the
// row in place; useReducedMotion halts it. Mirrors SpecialtyCarouselRow.
export const TestimonialsCarousel = ({
  items,
  direction = "left",
}: TestimonialsCarouselProps) => {
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const copies = Array.from({ length: REPEAT }, (_, copy) =>
    items.map((item) => ({ item, copy })),
  ).flat();

  useAnimationFrame((_, delta) => {
    if (paused || reduce) return;
    const total = trackRef.current?.scrollWidth ?? 0;
    const one = total / REPEAT;
    if (!one) return;
    let next = x.get() + (direction === "left" ? -1 : 1) * SPEED * (delta / 1000);
    if (next <= -one) next += one;
    if (next > 0) next -= one;
    x.set(next);
  });

  return (
    <div className="overflow-hidden py-6">
      <motion.div
        ref={trackRef}
        style={{ x }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="flex w-max gap-5"
      >
        {copies.map(({ item, copy }) => (
          <ReviewCard key={`${item.id}-${copy}`} review={item} />
        ))}
      </motion.div>
    </div>
  );
};
