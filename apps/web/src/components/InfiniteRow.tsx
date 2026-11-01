"use client";

import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { type ReactNode, useRef, useState } from "react";

interface InfiniteRowProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  direction?: "left" | "right";
  /** Copies rendered end-to-end; one copy stays narrower than total minus the
   *  viewport so wrapping x by a single copy's width loops seamlessly (>= 2). */
  repeat?: number;
  /** Scroll speed in px/second. */
  speed?: number;
}

// Infinite marquee driven entirely by motion/react: a single motion value is
// advanced each frame and wrapped within one copy's width, so it loops with no
// tween restart. Hovering pauses the row in place; useReducedMotion halts it.
// (Generalizes the former SpecialtyCarouselRow / TestimonialsCarousel.)
export function InfiniteRow<T extends { id: string }>({
  items,
  renderItem,
  direction = "left",
  repeat = 3,
  speed = 40,
}: InfiniteRowProps<T>) {
  const x = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const copies = Array.from({ length: repeat }, (_, copy) =>
    items.map((item) => ({ item, copy })),
  ).flat();

  useAnimationFrame((_, delta) => {
    if (paused || reduce) return;
    const total = trackRef.current?.scrollWidth ?? 0;
    const one = total / repeat;
    if (!one) return;
    let next =
      x.get() + (direction === "left" ? -1 : 1) * speed * (delta / 1000);
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
          <div key={`${item.id}-${copy}`} className="shrink-0">
            {renderItem(item)}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
