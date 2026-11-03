import type { ReactNode } from "react";

interface SheetProps {
  keyline?: boolean;
  className?: string;
  children: ReactNode;
  as?: "div" | "article" | "li";
}

/** A paper card. Keeps day colours on white even when lying on the night table. */
export const Sheet = ({
  keyline = false,
  className = "",
  children,
  as: Tag = "div",
}: SheetProps) => (
  <Tag
    data-tone="day"
    data-paper
    className={`relative rounded-[3px] bg-sheet text-fg shadow-[var(--shadow-sheet)] ${className}`}
  >
    {keyline ? (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-line"
      />
    ) : null}
    {children}
  </Tag>
);
