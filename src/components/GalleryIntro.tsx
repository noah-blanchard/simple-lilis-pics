"use client";

import { motion, useReducedMotion } from "motion/react";

import { EASE } from "@/lib/motion";

// Full-screen intro shown while the first gallery photo decodes. It keeps the
// user looking at something intentional — the project title over a quiet
// scanning line — instead of an empty frame, then fades away the moment the
// image is ready (the parent unmounts it via AnimatePresence).
export function GalleryIntro({ title }: { title: string }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-[var(--z-overlay)] flex flex-col items-center justify-center gap-6 bg-ink px-6 text-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.h2
        initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="display text-2xl text-fg italic md:text-4xl"
      >
        {title}
      </motion.h2>

      {/* Quiet loading line. Indeterminate scan when motion is allowed, a static
          accent rule otherwise (no infinite motion under reduced-motion). */}
      <div className="h-px w-40 overflow-hidden bg-line">
        {prefersReduced ? (
          <div className="h-full w-full bg-accent/60" />
        ) : (
          <motion.div
            className="h-full w-1/3 bg-accent"
            animate={{ x: ["-100%", "320%"] }}
            transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
}
