import type { ReactNode } from "react";

interface TagLabelProps {
  children: ReactNode;
  className?: string;
}

// Mono section eyebrow. The framing brackets carry the cognac accent (echoing
// the camera-viewfinder FocusBrackets motif) while the label text stays calmly
// muted — a small, signature dose of warmth above every section. When a caller
// passes `text-accent` (e.g. the login eyebrow) the whole label reads accent,
// which the bracket color simply matches.
export const TagLabel = ({ children, className = "" }: TagLabelProps) => (
  <span className={`tag-mono uppercase ${className}`}>
    <span className="text-accent">[</span>
    {children}
    <span className="text-accent">]</span>
  </span>
);
