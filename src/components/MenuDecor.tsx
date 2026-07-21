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
    src: "/illustrations/decor-set2-01-aperture-transparent.png",
    top: "20%",
    left: "42%",
    rotate: -14,
    widthClass: "w-44 lg:w-52 xl:w-60",
    delay: 0.5,
  },
  {
    src: "/illustrations/decor-set2-02-memory-card-transparent.png",
    top: "50%",
    left: "58%",
    rotate: 10,
    widthClass: "w-40 lg:w-48 xl:w-56",
    delay: 0.62,
  },
  {
    src: "/illustrations/decor-set2-03-wrist-strap-transparent.png",
    top: "78%",
    left: "44%",
    rotate: -8,
    widthClass: "w-40 lg:w-48 xl:w-56",
    delay: 0.74,
  },
];

// Desktop-only scattered decor for the expandable menu — three camera
// accessory illustrations trailing the nav links, each independently
// tilting in 3D toward the cursor while hovered. Since the overlay's whole
// subtree mounts fresh every time the menu opens, these replay their
// reveal (opacity/scale/rotate, staggered delays) on every open — the same
// entrance treatment as the Hero's decor pieces. Mobile gets a single
// static image instead (rendered by MenuOverlay, not this component).
export const MenuDecor = () => (
  <div className="relative hidden h-[65vh] max-h-[560px] w-full md:block">
    {PIECES.map((piece) => (
      <div
        key={piece.src}
        style={{ top: piece.top, left: piece.left }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 ${piece.widthClass}`}
      >
        <TiltImage src={piece.src} rotate={piece.rotate} delay={piece.delay} />
      </div>
    ))}
  </div>
);
