"use client";

import { CatIcon } from "@lili/ui/components/Icons";
import { EASE, zoomTransition } from "@lili/ui/lib/motion";
import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Image from "next/image";
import { type MouseEvent, type ReactNode, useRef } from "react";
import type { Specialty } from "@/types";

interface SpecialtyCardProps {
  specialty: Specialty;
  /** Mouse-reactive 3D tilt + photo wipe-reveal (desktop only — needs a mouse). */
  tilt?: boolean;
  /** Position in the mobile 2-col grid; staggers the scroll reveal per column. */
  index?: number;
}

// Hover-driven, fully presentational. Colours are Tailwind classes (so they flip
// with the theme); motion only animates transforms + opacity. The card surface
// (panel → accent) is an opacity overlay and the text recolours by cross-fading
// two identical content layers — motion never owns a theme-dependent colour.
const transition = { duration: 0.3, ease: EASE } as const;
const tiltSpring = { stiffness: 150, damping: 18, mass: 0.5 } as const;

const liftVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
};

// Radius (%) a clip-path circle needs to fully cover a square box from any
// origin point: percentages resolve against the side length, and the
// farthest corner is the diagonal (~141% of the side) — 150% adds margin.
const FULL_COVER_RADIUS = 150;

export const SpecialtyCard = ({
  specialty,
  tilt,
  index,
}: SpecialtyCardProps) => {
  // One content layer; rendered twice with different colour classes. Sizes are
  // unprefixed (mobile, where this only renders below `md`) vs `md:` (desktop
  // tilt cards, which only render at `md`+) — the two breakpoints never
  // overlap, so shrinking mobile here can't touch the desktop tilt-card sizing.
  const layer = (textClass: string, descClass: string) => (
    <div className="absolute inset-0 flex flex-col justify-between p-4 text-left md:p-7">
      <div className="flex justify-end">
        <CatIcon
          kind={specialty.id}
          className={`h-7 w-7 md:h-9 md:w-9 ${textClass}`}
        />
      </div>
      <div>
        <div
          className={`mb-1 font-semibold text-lg tracking-tight md:mb-2 md:text-[28px] ${textClass}`}
        >
          {specialty.title}
        </div>
        <p
          className={`line-clamp-3 text-xs leading-snug md:text-[13px] ${descClass}`}
        >
          {specialty.desc}
        </p>
      </div>
    </div>
  );

  if (tilt) {
    return <TiltCard specialty={specialty}>{layer}</TiltCard>;
  }

  return (
    <MobileCard specialty={specialty} index={index}>
      {layer}
    </MobileCard>
  );
};

interface SpecialtyCardShellProps {
  specialty: Specialty;
  children: (textClass: string, descClass: string) => ReactNode;
}

// Touch devices have no hover, so the mobile grid card reveals its photo as it
// scrolls into view instead of on tap. Scroll progress (scrubbed, so it reverses
// when scrolling back up) is smoothed by a spring and drives a bottom-up
// clip-path wipe plus a subtle de-zoom. The same clipPath drives the photo and
// the on-accent text layer so they arrive in sync (like TiltCard). Right-column
// cards start a little later so the two columns cascade.
const revealSpring = { stiffness: 120, damping: 24, mass: 0.4 } as const;
const REVEAL_OFFSETS = [
  ["start 90%", "start 35%"],
  ["start 82%", "start 27%"],
] as const;

const MobileCard = ({
  specialty,
  index = 0,
  children: layer,
}: SpecialtyCardShellProps & { index?: number }) => {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: [...REVEAL_OFFSETS[index % 2]],
  });
  const progress = useSpring(scrollYProgress, revealSpring);

  const top = useTransform(progress, [0, 1], [100, 0]);
  const clipPath = useMotionTemplate`inset(${top}% 0% 0% 0%)`;
  const scale = useTransform(progress, [0, 1], [1.15, 1]);
  const restOpacity = useTransform(progress, [0.6, 1], [1, 0]);

  return (
    <div
      ref={ref}
      className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-panel text-left"
    >
      {/* rest content (always rendered underneath the wipe) */}
      <motion.div style={{ opacity: reduce ? 0 : restOpacity }}>
        {layer("text-fg", "text-muted")}
      </motion.div>

      {/* photo, wiped in from the bottom */}
      <motion.div
        aria-hidden
        style={{ clipPath: reduce ? "inset(0% 0% 0% 0%)" : clipPath }}
        className="absolute inset-0"
      >
        <motion.div
          style={{ scale: reduce ? 1 : scale }}
          className="absolute inset-0"
        >
          <Image
            src={specialty.image}
            alt=""
            fill
            sizes="50vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-scrim" />
      </motion.div>

      {/* on-photo text, clipped in sync with the photo */}
      <motion.div
        aria-hidden
        style={{ clipPath: reduce ? "inset(0% 0% 0% 0%)" : clipPath }}
        className="absolute inset-0"
      >
        {layer("text-on-accent", "text-on-accent")}
      </motion.div>
    </div>
  );
};

// Mouse-reactive 3D tilt: the corner nearest the cursor presses inward, the
// opposite corner lifts. A photo wipes in (clip-path circle) from wherever
// the cursor entered, replacing the flat accent surface — the same clipPath
// value drives both the photo and the on-accent text layer, so they arrive
// in sync (a wipe standing in for the flat card's opacity cross-fade).
const TiltCard = ({ specialty, children: layer }: SpecialtyCardShellProps) => {
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
