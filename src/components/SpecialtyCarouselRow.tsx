"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { useRef, useState } from "react";
import type { Specialty } from "@/types";
import { SpecialtyCard } from "./SpecialtyCard";

interface SpecialtyCarouselRowProps {
  items: Specialty[];
  direction: "left" | "right";
}

// Copies of the item set rendered end-to-end. One copy stays narrower than the
// total minus the viewport, so wrapping x by a single copy's width loops seamlessly.
const REPEAT = 4;
// Scroll speed in px/second.
const SPEED = 40;

// Infinite marquee driven entirely by motion/react: a single motion value is
// advanced each frame and wrapped within one copy's width. Hovering pauses the
// row in place (no tween restart). Direction sets the sign of the velocity.
export const SpecialtyCarouselRow = ({
  items,
  direction,
}: SpecialtyCarouselRowProps) => {
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
    let next =
      x.get() + (direction === "left" ? -1 : 1) * SPEED * (delta / 1000);
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
          <div key={`${item.id}-${copy}`} className="w-[300px] shrink-0">
            <SpecialtyCard specialty={item} />
          </div>
        ))}
      </motion.div>
    </div>
  );
};
