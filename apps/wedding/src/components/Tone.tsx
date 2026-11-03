import type { ReactNode } from "react";

interface ToneProps {
  tone: "day" | "night";
  as?: "section" | "div" | "footer" | "header";
  id?: string;
  className?: string;
  children: ReactNode;
  "aria-labelledby"?: string;
}

/** A band of the page in day or night colours. Night values come from the
 *  `[data-tone="night"]` scope in globals.css, so night adds no colour classes. */
export const Tone = ({
  tone,
  as: Tag = "div",
  id,
  className = "",
  children,
  "aria-labelledby": labelledBy,
}: ToneProps) => (
  <Tag
    id={id}
    data-tone={tone}
    aria-labelledby={labelledBy}
    className={[tone === "day" ? "bg-ink text-fg" : "", className]
      .filter(Boolean)
      .join(" ")}
  >
    {children}
  </Tag>
);
