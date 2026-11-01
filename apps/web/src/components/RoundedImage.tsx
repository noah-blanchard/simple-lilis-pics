"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { zoomTransition } from "@/lib/motion";

interface RoundedImageProps {
  src: string;
  alt?: string;
  /** Tailwind aspect-ratio class, e.g. "aspect-[4/5]". */
  ratio?: string;
  className?: string;
  /** `sizes` hint for responsive optimization. */
  sizes?: string;
  priority?: boolean;
  zoom?: boolean;
  children?: ReactNode;
  /** Opt into a Motion shared-layout transition (e.g. morphing into a modal
   *  backdrop that renders another element with the same layoutId). */
  layoutId?: string;
}

// Rounded, cover-fit image with optional hover-zoom and overlay children.
// Uses next/image (fill) for optimization + low CLS. The hover-zoom (and any
// overlay chrome passed as children) is driven by motion/react variant
// propagation from this container — hovering it flips the "rest" → "hover"
// label that descendant motion components inherit.
export const RoundedImage = ({
  src,
  alt = "",
  ratio = "aspect-[4/5]",
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  zoom = true,
  children,
  layoutId,
}: RoundedImageProps) => {
  const reduce = useReducedMotion();
  const enableZoom = zoom && !reduce;

  return (
    <motion.div
      layoutId={layoutId}
      className={`group relative overflow-hidden rounded-card bg-panel ${ratio} ${className}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
    >
      <motion.div
        className="absolute inset-0"
        variants={{
          rest: { scale: 1 },
          hover: { scale: enableZoom ? 1.06 : 1 },
        }}
        transition={zoomTransition}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </motion.div>
      {children}
    </motion.div>
  );
};
