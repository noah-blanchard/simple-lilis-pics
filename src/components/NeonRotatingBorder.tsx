"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

interface NeonRotatingBorderProps {
  children: ReactNode;
  /** Classes for the outer wrapper (rounding, shadow overrides, sizing). */
  className?: string;
  /** Classes for the opaque surface that sits on top of the rotating glow. */
  surfaceClassName?: string;
  /** Full rotation duration in seconds. */
  duration?: number;
}

const INFINITE = Number.POSITIVE_INFINITY;

// Built from the theme's --accent token (color-mix, so it tracks the
// light/dark palette swap automatically) rather than a fixed hex — a faint
// constant ring plus one bright sweeping arc, tinted toward white at its peak.
const DIM = "color-mix(in srgb, var(--accent) 12%, transparent)";
const BRIGHT = "var(--accent)";
const HOT = "color-mix(in srgb, var(--accent) 55%, white 45%)";
const GRADIENT = `conic-gradient(from 0deg, ${DIM}, ${BRIGHT} 25deg, ${HOT} 40deg, ${DIM} 70deg, ${DIM} 360deg)`;
const GLOW_SHADOW = `0 0 25px -8px color-mix(in srgb, var(--accent) 40%, transparent)`;

/**
 * Thin animated neon border: a crisp rotating conic gradient clipped to a
 * 1.5px frame, sitting behind an opaque surface that shows only the edge.
 * Extracted so any card (admin login, contact form, …) can opt into the
 * same glowing rotation effect without duplicating the gradient/motion setup.
 */
export const NeonRotatingBorder = ({
  children,
  className = "",
  surfaceClassName = "",
  duration = 5,
}: NeonRotatingBorderProps) => {
  const reduce = useReducedMotion();

  return (
    <div
      className={`relative overflow-hidden rounded-card p-[1.5px] ${className}`}
      style={{ boxShadow: GLOW_SHADOW }}
    >
      <motion.div
        aria-hidden
        className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 aspect-square w-[160%]"
        style={{ background: GRADIENT }}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration, repeat: INFINITE, ease: "linear" }}
      />

      <div
        className={`relative overflow-hidden rounded-card bg-panel ${surfaceClassName}`}
      >
        {children}
      </div>
    </div>
  );
};
