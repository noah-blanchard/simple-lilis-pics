import { Photo, type PhotoProps } from "./Photo";

interface PrintProps {
  photo: PhotoProps;
  caption?: string;
  /** Static rotation in degrees, clamped to ±2. */
  rotate?: number;
  className?: string;
}

/** A photograph on a paper print with a caption in the bottom margin. */
export const Print = ({
  photo,
  caption,
  rotate = 0,
  className = "",
}: PrintProps) => {
  const deg = Math.max(-2, Math.min(2, rotate));
  return (
    <figure
      data-tone="day"
      data-paper
      className={`relative bg-sheet p-[10px] pb-10 text-fg shadow-[var(--shadow-sheet)] ${className}`}
      style={deg ? { transform: `rotate(${deg}deg)` } : undefined}
    >
      <Photo {...photo} />
      {caption ? (
        <figcaption className="absolute inset-x-3 bottom-2.5 truncate text-[14px] text-muted italic">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
};
