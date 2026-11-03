"use client";

import Image, { type StaticImageData } from "next/image";

export type PhotoRatio = "3/2" | "2/3" | "4/5" | "16/9" | "1/1";

// Literal classes so Tailwind sees every ratio.
const RATIO: Record<PhotoRatio, string> = {
  "3/2": "aspect-[3/2]",
  "2/3": "aspect-[2/3]",
  "4/5": "aspect-[4/5]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
};

export interface PhotoProps {
  src: string | StaticImageData;
  alt: string;
  ratio: PhotoRatio;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
}

/** Square-cornered photograph in a fixed-ratio box. Saving is discouraged. */
export const Photo = ({
  src,
  alt,
  ratio,
  sizes,
  priority = false,
  className = "",
  imgClassName = "",
}: PhotoProps) => (
  <div
    className={`relative overflow-hidden bg-panel ${RATIO[ratio]} ${className}`}
  >
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      draggable={false}
      onContextMenu={(e) => e.preventDefault()}
      className={`no-save object-cover ${imgClassName}`}
    />
  </div>
);
