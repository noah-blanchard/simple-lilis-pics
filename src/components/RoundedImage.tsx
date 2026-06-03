import Image from "next/image";
import type { ReactNode } from "react";

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
}

// Rounded, cover-fit image with optional hover-zoom and overlay children.
// Uses next/image (fill) for optimization + low CLS.
export const RoundedImage = ({
  src,
  alt = "",
  ratio = "aspect-[4/5]",
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  zoom = true,
  children,
}: RoundedImageProps) => (
  <div
    className={`group relative overflow-hidden rounded-card bg-panel ${ratio} ${className}`}
  >
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${zoom ? "img-zoom" : ""}`}
    />
    {children}
  </div>
);
