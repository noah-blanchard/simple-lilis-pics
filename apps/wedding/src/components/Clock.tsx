"use client";

interface ClockProps {
  time: string;
  part: string;
  compact?: boolean;
}

/** The big running time and the italic part of the day. Decorative: every
 *  moment also prints its own time as text. */
export const Clock = ({ time, part, compact = false }: ClockProps) => (
  <div
    aria-hidden
    className={compact ? "flex items-baseline gap-3" : "flex flex-col gap-2"}
  >
    <p
      className={`display lining-nums tabular-nums leading-none ${
        compact ? "text-[40px]" : "text-[clamp(64px,8vw,128px)]"
      }`}
    >
      {time}
    </p>
    <p className="font-display text-[20px] text-muted italic">{part}</p>
  </div>
);
