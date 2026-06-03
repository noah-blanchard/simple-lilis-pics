import type { ReactNode } from "react";

interface TagLabelProps {
  children: ReactNode;
  className?: string;
}

export const TagLabel = ({ children, className = "" }: TagLabelProps) => (
  <span className={`tag-mono uppercase ${className}`}>[{children}]</span>
);
