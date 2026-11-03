"use client";

import { hoverColorTransition } from "@lili/ui/lib/motion";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

interface TextLinkProps {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  pressed?: boolean;
  className?: string;
  children: ReactNode;
}

const MotionLink = motion.create(Link);

/** Quiet text link: muted, turns to full ink on hover. No underline, no arrow. */
export const TextLink = ({
  href,
  external = false,
  onClick,
  pressed = false,
  className = "",
  children,
}: TextLinkProps) => {
  const cls = `inline-block py-1 ${pressed ? "text-fg" : "text-muted"} ${className}`;
  const hover = { color: "var(--fg)" };

  if (href && external) {
    return (
      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        whileHover={hover}
        transition={hoverColorTransition}
      >
        {children}
      </motion.a>
    );
  }
  if (href?.startsWith("#")) {
    return (
      <motion.a
        href={href}
        className={cls}
        whileHover={hover}
        transition={hoverColorTransition}
      >
        {children}
      </motion.a>
    );
  }
  if (href) {
    return (
      <MotionLink
        href={href}
        className={cls}
        whileHover={hover}
        transition={hoverColorTransition}
      >
        {children}
      </MotionLink>
    );
  }
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cls}
      whileHover={hover}
      transition={hoverColorTransition}
    >
      {children}
    </motion.button>
  );
};
