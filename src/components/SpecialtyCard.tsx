"use client";

import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Image from "next/image";
import { type MouseEvent, type ReactNode, useRef } from "react";
import { EASE, zoomTransition } from "@/lib/motion";
import type { Specialty } from "@/types";
import { CatIcon } from "./Icons";

interface SpecialtyCardProps {
  specialty: Specialty;
  /** Mouse-reactive 3D tilt + photo wipe-reveal (desktop only — needs a mouse). */
  tilt?: boolean;
}

// Hover-driven, fully presentational. Colours are Tailwind classes (so they flip
// with the theme); motion only animates transforms + opacity. The card surface
// (panel → accent) is an opacity overlay and the text recolours by cross-fading
// two identical content layers — motion never owns a theme-dependent colour.
const transition = { duration: 0.3, ease: EASE } as const;
const tiltSpring = { stiffness: 150, damping: 18, mass: 0.5 } as const;

const cardVariants: Variants = {
  rest: { scale: 1, rotate: 0 },
  hover: { scale: 1.04, rotate: -1.5 },
};
const liftVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};
const fadeIn: Variants = { rest: { opacity: 0 }, hover: { opacity: 1 } };
const fadeOut: Variants = { rest: { opacity: 1 }, hover: { opacity: 0 } };

// Radius (%) a clip-path circle needs to fully cover a square box from any
// origin point: percentages resolve against the side length, and the
// farthest corner is the diagonal (~141% of the side) — 150% adds margin.
const FULL_COVER_RADIUS = 150;

export const SpecialtyCard = ({ specialty, tilt }: SpecialtyCardProps) => {
  // One content layer; rendered twice with different colour classes.
  const layer = (textClass: string, descClass: string) => (
    <div className="absolute inset-0 flex flex-col justify-between p-7 text-left">
      <div className="flex justify-end">
        <CatIcon kind={specialty.id} className={`h-9 w-9 ${textClass}`} />
      </div>
      <div>
        <div
          className={`mb-2 font-semibold text-2xl tracking-tight md:text-[28px] ${textClass}`}
        >
          {specialty.title}
        </div>
        <p className={`text-[13px] leading-snug ${descClass}`}>
          {specialty.desc}
        </p>
      </div>
    </div>
  );

  if (tilt) {
    return <TiltCard specialty={specialty}>{layer}</TiltCard>;
  }

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardVariants}
      transition={transition}
      className="relative aspect-square w-full overflow-hidden rounded-card bg-panel"
    >
      {/* accent surface on hover */}
      <motion.span
        aria-hidden
        variants={fadeIn}
        transition={transition}
        className="absolute inset-0 bg-accent"
      />

      {/* rest content (fades out) */}
      <motion.div variants={fadeOut} transition={transition}>
        {layer("text-fg", "text-muted")}
      </motion.div>

      {/* hover content (fades in) — hidden from AT to avoid duplicate reading */}
      <motion.div aria-hidden variants={fadeIn} transition={transition}>
        {layer("text-on-accent", "text-on-accent")}
      </motion.div>
    </motion.div>
  );
};

interface TiltCardProps {
  specialty: Specialty;
  children: (textClass: string, descClass: string) => ReactNode;
}

// Mouse-reactive 3D tilt: the corner nearest the cursor presses inward, the
// opposite corner lifts. A photo wipes in (clip-path circle) from wherever
// the cursor entered, replacing the flat accent surface — the same clipPath
// value drives both the photo and the on-accent text layer, so they arrive
// in sync (a wipe standing in for the flat card's opacity cross-fade).
const TiltCard = ({ specialty, children: layer }: TiltCardProps) => {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const px = useMotionValue(0); // -0.5..0.5 across card width
  const py = useMotionValue(0); // -0.5..0.5 across card height
  const rotateX = useSpring(
    useTransform(py, [-0.5, 0.5], ["7deg", "-7deg"]),
    tiltSpring,
  );
  const rotateY = useSpring(
    useTransform(px, [-0.5, 0.5], ["-7deg", "7deg"]),
    tiltSpring,
  );

  const originX = useMotionValue(50); // %, set once on enter (not spring'd)
  const originY = useMotionValue(50);
  const progress = useMotionValue(0); // 0 -> 1 wipe progress
  const radius = useTransform(progress, [0, 1], [0, FULL_COVER_RADIUS]);
  const clipPath = useMotionTemplate`circle(${radius}% at ${originX}% ${originY}%)`;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseEnter = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      originX.set(((e.clientX - rect.left) / rect.width) * 100);
      originY.set(((e.clientY - rect.top) / rect.height) * 100);
    }
    if (reduce) {
      progress.set(1);
    } else {
      animate(progress, 1, zoomTransition);
    }
  };

  const handleMouseLeave = () => {
    px.set(0);
    py.set(0);
    if (reduce) {
      progress.set(0);
    } else {
      animate(progress, 0, zoomTransition);
    }
  };

  return (
    <div className="[perspective:1000px]">
      <motion.div
        ref={cardRef}
        initial="rest"
        whileHover="hover"
        animate="rest"
        variants={liftVariants}
        transition={transition}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY }}
        className="relative aspect-square w-full overflow-hidden rounded-card bg-panel [transform-style:preserve-3d]"
      >
        {/* base layer (rest, always visible underneath the wipe) */}
        {layer("text-fg", "text-muted")}

        {/* photo, clipped by the wipe */}
        <motion.div
          aria-hidden
          style={{ clipPath }}
          className="absolute inset-0"
        >
          <Image
            src={specialty.image}
            alt=""
            fill
            sizes="(max-width: 1024px) 260px, (max-width: 1536px) 340px, 380px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-scrim" />
        </motion.div>

        {/* on-accent text, clipped in sync with the photo */}
        <motion.div
          aria-hidden
          style={{ clipPath }}
          className="absolute inset-0"
        >
          {layer("text-on-accent", "text-on-accent")}
        </motion.div>
      </motion.div>
    </div>
  );
};
