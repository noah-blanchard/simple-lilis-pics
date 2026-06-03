"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
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
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-4 text-[15px] font-medium";

interface VariantConfig {
  bg: string; // static base background
  fill: string; // colour that wipes in on hover
  textRest: string;
  textHover: string;
  extra?: string; // extra static classes (e.g. ghost border)
}

const config: Record<PillVariant, VariantConfig> = {
  light: {
    bg: "#ffffff",
    fill: "#f5e155",
    textRest: "#0a0a0a",
    textHover: "#0a0a0a",
  },
  dark: {
    bg: "#141414",
    fill: "#1c1c1c",
    textRest: "#ffffff",
    textHover: "#ffffff",
  },
  accent: {
    bg: "#f5e155",
    fill: "#ffffff",
    textRest: "#0a0a0a",
    textHover: "#0a0a0a",
  },
  ghost: {
    bg: "transparent",
    fill: "#ffffff",
    textRest: "#ffffff",
    textHover: "#0a0a0a",
    extra: "border border-white/15",
  },
};

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] } as const;

export const PillButton = ({
  children,
  variant = "light",
  className = "",
  href,
  type = "button",
  disabled = false,
}: PillButtonProps) => {
  const reduce = useReducedMotion();
  const cfg = config[variant];

  // Left→right fill (or a fade when motion is reduced).
  const fillVariants: Variants = reduce
    ? { rest: { opacity: 0 }, hover: { opacity: 1 } }
    : { rest: { scaleX: 0 }, hover: { scaleX: 1 } };

  // Slot-machine roll + text colour (colour only when motion is reduced).
  const textVariants: Variants = reduce
    ? { rest: { color: cfg.textRest }, hover: { color: cfg.textHover } }
    : {
        rest: { y: "-50%", color: cfg.textRest },
        hover: { y: "0%", color: cfg.textHover },
      };

  const fill = (
    <motion.span
      aria-hidden
      variants={fillVariants}
      transition={transition}
      style={{ originX: 0, backgroundColor: cfg.fill }}
      className="absolute inset-0 rounded-full"
    />
  );

  // The label rolls within a one-line window; the column holds two identical
  // copies (the second hidden from assistive tech so the name isn't doubled).
  const content = reduce ? (
    <motion.span
      variants={textVariants}
      transition={transition}
      className="relative z-10"
    >
      {children}
    </motion.span>
  ) : (
    <span className="relative z-10 block h-[1.5em] overflow-hidden">
      <motion.span
        variants={textVariants}
        transition={transition}
        className="flex flex-col"
      >
        <span className="block h-[1.5em] leading-[1.5em]">{children}</span>
        <span aria-hidden className="block h-[1.5em] leading-[1.5em]">
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
    style: { backgroundColor: cfg.bg },
    className: `${base} ${cfg.extra ?? ""} ${className}`,
  };

  if (href) {
    return (
      <motion.a href={href} {...rootProps}>
        {fill}
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} disabled={disabled} {...rootProps}>
      {fill}
      {content}
    </motion.button>
  );
};
