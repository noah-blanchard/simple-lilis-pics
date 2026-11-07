"use client";

import { CatIcon } from "@lili/ui/components/Icons";
import { EASE, zoomTransition } from "@lili/ui/lib/motion";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Image from "next/image";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Specialty } from "@/types";

interface SpecialtyCardProps {
  specialty: Specialty;
  /** Mouse-reactive 3D tilt + photo wipe-reveal (desktop only — needs a mouse). */
  tilt?: boolean;
  /** Position in the mobile 2-col grid; picks the slide-in side per column. */
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

// Touch devices have no hover, so the mobile grid card is a tap-toggled button
// with an entrance. Cards start off-screen on their own side (left column from
// the left, right column from the right) and, when scrolled into view (once),
// spring into their slot so each row's pair converges and snaps together; the
// right card lags slightly ("clac... clac"). Once a card has landed its photo
// pops in (fade + settling scale, kept on an inner wrapper so the card edges
// never grow) while the text layers cross-fade. Tapping toggles the photo.
// The slide lives on a wrapper so it never competes with the button's whileTap
// scale, and its completion cleanly signals "landed".
const slideSpring = {
  type: "spring",
  stiffness: 320,
  damping: 22,
  mass: 0.9,
} as const;
const popSpring = { type: "spring", stiffness: 260, damping: 18 } as const;
const SLIDE_OFFSET = 110;
const SLIDE_ROTATE = 6;
const RIGHT_COLUMN_DELAY = 0.12;
const PHOTO_ZOOM = 1.12;

const MobileCard = ({
  specialty,
  index = 0,
  children: layer,
}: SpecialtyCardShellProps & { index?: number }) => {
  const reduce = useReducedMotion();
  const [showPhoto, setShowPhoto] = useState(false);
  const toggle = () => setShowPhoto((v) => !v);

  // Reduced motion: no entrance, photo is shown straight away.
  useEffect(() => {
    if (reduce) setShowPhoto(true);
  }, [reduce]);

  const slotRef = useRef<HTMLDivElement>(null);
  const inView = useInView(slotRef, { once: true, amount: 0.35 });

  const dir = index % 2 === 0 ? -1 : 1;
  const delay = dir === 1 ? RIGHT_COLUMN_DELAY : 0;
  const offscreen = {
    x: `${dir * SLIDE_OFFSET}%`,
    rotate: dir * SLIDE_ROTATE,
    opacity: 0,
  };
  const landed = { x: "0%", rotate: 0, opacity: 1 };
  const fade = { duration: 0.3, ease: EASE } as const;

  return (
    // Observe a static wrapper: the sliding card starts fully off-screen, so
    // observing it directly (transforms count for IntersectionObserver)
    // would never fire.
    <div ref={slotRef}>
      <motion.div
        initial={reduce ? false : offscreen}
        animate={reduce || inView ? landed : offscreen}
        transition={{
          x: { ...slideSpring, delay },
          rotate: { ...slideSpring, delay },
          opacity: { duration: 0.25, ease: EASE, delay },
        }}
        onAnimationComplete={() => {
          if (inView && !reduce) setShowPhoto(true);
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={toggle}
          aria-pressed={showPhoto}
          className="relative aspect-[4/5] w-full cursor-pointer select-none overflow-hidden rounded-card bg-panel text-left"
        >
          {/* rest content (fades out when the photo shows) */}
          <motion.div
            initial={false}
            animate={{ opacity: showPhoto ? 0 : 1 }}
            transition={fade}
          >
            {layer("text-fg", "text-muted")}
          </motion.div>

          {/* photo: fades in; inner wrapper pops from slightly zoomed to 1 */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: showPhoto ? 1 : 0 }}
            transition={fade}
            className="absolute inset-0"
          >
            <motion.div
              initial={false}
              animate={{ scale: reduce || showPhoto ? 1 : PHOTO_ZOOM }}
              transition={reduce ? { duration: 0 } : popSpring}
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

          {/* on-photo text, fades in with the photo */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{ opacity: showPhoto ? 1 : 0 }}
            transition={fade}
          >
            {layer("text-on-accent", "text-on-accent")}
          </motion.div>
        </motion.button>
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
