"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import Image from "next/image";
import type { MouseEvent as ReactMouseEvent } from "react";
import { EASE } from "@/lib/motion";

const MAX_TILT = 20;
const TILT_SPRING = { stiffness: 200, damping: 18, mass: 0.4 } as const;

interface TiltImageProps {
  src: string;
  /** Resting rotation (degrees) once the entrance animation settles. */
  rotate: number;
  delay?: number;
  /** Sizing classes for the tilting wrapper (e.g. `w-40 lg:w-56`). */
  className?: string;
}

// A decorative illustration that tilts in 3D toward the cursor while
// hovered. Each instance tracks its own pointer position independently —
// no shared state between pieces — so a group of these scatters and reacts
// individually rather than moving as one.
export const TiltImage = ({
  src,
  rotate,
  delay = 0,
  className = "",
}: TiltImageProps) => {
  const reduce = useReducedMotion();
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const tiltX = useSpring(rawRotateX, TILT_SPRING);
  const tiltY = useSpring(rawRotateY, TILT_SPRING);

  const onMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rawRotateY.set(px * MAX_TILT * 2);
    rawRotateX.set(-py * MAX_TILT * 2);
  };

  const onMouseLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, scale: 0.9, rotate: rotate - 5 }}
      animate={{ opacity: 1, scale: 1, rotate }}
      transition={{ duration: 1, delay, ease: EASE }}
      style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 700 }}
      className={`pointer-events-auto opacity-90 ${className}`}
    >
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={1086}
        height={1448}
        className="h-auto w-full"
      />
    </motion.div>
  );
};
