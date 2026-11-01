"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

/** Loading placeholders for the admin photo grid. Pulse is driven by
 *  motion/react (no CSS keyframes), per project animation rules. */
export function PhotoSkeletonGrid({ count = 8 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [ids] = useState(() =>
    Array.from({ length: count }, () => crypto.randomUUID()),
  );

  const pulse = reduce
    ? {}
    : {
        animate: { opacity: [0.45, 0.85, 0.45] },
        transition: {
          duration: 1.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut" as const,
        },
      };

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {ids.map((id) => (
        <div key={id} className="overflow-hidden rounded-card bg-panel">
          <motion.div className="aspect-4/5 bg-fg/5" {...pulse} />
          <div className="space-y-2 p-4">
            <motion.div className="h-4 w-3/4 rounded bg-fg/5" {...pulse} />
            <motion.div className="h-3 w-1/2 rounded bg-fg/5" {...pulse} />
          </div>
        </div>
      ))}
    </div>
  );
}
