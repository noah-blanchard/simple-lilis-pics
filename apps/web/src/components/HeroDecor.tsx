"use client";

import { TiltImage } from "./TiltImage";

interface DecorConfig {
  src: string;
  top: string;
  left: string;
  rotate: number;
  widthClass: string;
  delay: number;
}

const PIECES: DecorConfig[] = [
  {
    src: "/illustrations/decor-set-01-prints-transparent.png",
    top: "34%",
    left: "41%",
    rotate: -18,
    widthClass: "w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72",
    delay: 0.5,
  },
  {
    src: "/illustrations/decor-set-03-film-roll-transparent.png",
    top: "48%",
    left: "53%",
    rotate: 14,
    widthClass: "w-36 sm:w-44 md:w-52 lg:w-60 xl:w-64",
    delay: 0.65,
  },
  {
    src: "/illustrations/decor-set-02-light-meter-transparent.png",
    top: "64%",
    left: "42%",
    rotate: -9,
    widthClass: "w-32 sm:w-40 md:w-44 lg:w-52 xl:w-56",
    delay: 0.8,
  },
];

// Desktop-only decorative layer floating in the gap between the Hero's nav
// rail and carousel: three illustrations scattered like they were dropped
// there (varied rotation + size). Each piece tilts independently in 3D
// toward the cursor only while hovered — no shared/global mouse tracking.
export const HeroDecor = () => (
  <div className="pointer-events-none absolute inset-0 z-0 hidden min-[1350px]:block">
    {PIECES.map((piece) => (
      <div
        key={piece.src}
        style={{ top: piece.top, left: piece.left }}
        className={`-translate-x-1/2 -translate-y-1/2 absolute ${piece.widthClass}`}
      >
        <TiltImage src={piece.src} rotate={piece.rotate} delay={piece.delay} />
      </div>
    ))}
  </div>
);
