import type { ReactNode } from "react";
import type { PillVariant } from "@/types";

interface PillButtonProps {
  children: ReactNode;
  variant?: PillVariant;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-[15px] font-medium transition-all duration-300";

const styles: Record<PillVariant, string> = {
  light: "bg-white text-ink hover:bg-accent",
  dark: "bg-panel text-white hover:bg-panel2",
  accent: "bg-accent text-ink hover:bg-white",
  ghost: "border border-white/15 text-white hover:bg-white hover:text-ink",
};

export const PillButton = ({
  children,
  variant = "light",
  className = "",
  href,
  type = "button",
  disabled = false,
}: PillButtonProps) => {
  const classes = `${base} ${styles[variant]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled} className={classes}>
      {children}
    </button>
  );
};
