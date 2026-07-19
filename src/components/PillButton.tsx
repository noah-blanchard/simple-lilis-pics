"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";
import type { PillVariant } from "@/types";

type PillSize = "sm" | "md";

interface PillButtonProps {
  children: ReactNode;
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  ariaExpanded?: boolean;
  ariaControls?: string;
}

const base =
  "relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full font-medium";

// `sm` matches the LocaleSwitcher / ThemeToggle control height (~36px) so the
// nav cluster lines up; `md` is the default page CTA size.
const sizeClass: Record<PillSize, string> = {
  sm: "px-4 py-2 text-[12px]",
  md: "px-7 py-4 text-[15px]",
};

// All colors are Tailwind utility classes so they flip with the `.dark` class
// on <html>. motion only animates transforms (the fill wipe + text roll) — it
// never owns a theme-dependent color, which is what caused the white-on-white
// bug (motion drops `var()` color values and propagated child variants don't
// re-resolve on theme change).
interface VariantConfig {
  bg: string; // static base background class
  fill: string; // class for the colour that wipes in on hover
  textRest: string; // text colour class shown at rest
  textHover: string; // text colour class shown on hover (under the fill)
  extra?: string; // extra static classes (e.g. ghost/danger border)
}

const config: Record<PillVariant, VariantConfig> = {
  light: {
    bg: "bg-inverse",
    fill: "bg-accent",
    textRest: "text-on-inverse",
    textHover: "text-on-accent",
  },
  dark: {
    bg: "bg-panel",
    fill: "bg-panel2",
    textRest: "text-fg",
    textHover: "text-fg",
  },
  accent: {
    bg: "bg-accent",
    fill: "bg-inverse",
    textRest: "text-on-accent",
    textHover: "text-on-inverse",
  },
  ghost: {
    bg: "bg-transparent",
    fill: "bg-inverse",
    textRest: "text-fg",
    textHover: "text-on-inverse",
    extra: "border border-fg/15",
  },
  danger: {
    bg: "bg-transparent",
    fill: "bg-danger",
    textRest: "text-fg",
    textHover: "text-on-danger",
    extra: "border border-fg/15",
  },
};

const transition = { duration: 0.45, ease: EASE } as const;

export const PillButton = ({
  children,
  variant = "light",
  size = "md",
  className = "",
  href,
  type = "button",
  disabled = false,
  onClick,
  ariaExpanded,
  ariaControls,
}: PillButtonProps) => {
  const reduce = useReducedMotion();
  const cfg = config[variant];

  // Left→right fill (or a fade when motion is reduced).
  const fillVariants: Variants = reduce
    ? { rest: { opacity: 0 }, hover: { opacity: 1 } }
    : { rest: { scaleX: 0 }, hover: { scaleX: 1 } };

  // Slot-machine roll (transform only — colours live on the two copies below).
  const textVariants: Variants = reduce
    ? { rest: {}, hover: {} }
    : { rest: { y: "-50%" }, hover: { y: "0%" } };

  const fill = (
    <motion.span
      aria-hidden
      variants={fillVariants}
      transition={transition}
      style={{ originX: 0 }}
      className={`absolute inset-0 rounded-full ${cfg.fill}`}
    />
  );

  // The label rolls within a one-line window; the column holds two copies. The
  // window shows the SECOND copy at rest and the FIRST copy on hover, so the
  // first copy carries the hover colour and the second the rest colour. The
  // second copy is hidden from assistive tech so the name isn't doubled.
  const content = reduce ? (
    <span className={`relative z-10 ${cfg.textRest}`}>{children}</span>
  ) : (
    <span className="relative z-10 block h-[1.5em] overflow-hidden">
      <motion.span
        variants={textVariants}
        transition={transition}
        className="flex flex-col"
      >
        <span className={`block h-[1.5em] leading-[1.5em] ${cfg.textHover}`}>
          {children}
        </span>
        <span
          aria-hidden
          className={`block h-[1.5em] leading-[1.5em] ${cfg.textRest}`}
        >
          {children}
        </span>
      </motion.span>
    </span>
  );

  const rootProps = {
    initial: "rest",
    animate: "rest",
    whileHover: "hover",
    variants: { rest: {}, hover: {} } as Variants,
    className: `${base} ${sizeClass[size]} ${cfg.bg} ${cfg.extra ?? ""} ${className}`,
  };

  const inner = (
    <>
      {fill}
      {content}
    </>
  );

  if (href) {
    return (
      <motion.a href={href} {...rootProps}>
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      {...rootProps}
    >
      {inner}
    </motion.button>
  );
};
