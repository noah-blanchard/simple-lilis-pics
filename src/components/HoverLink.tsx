"use client";

import { motion, type TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";
import { hoverColorTransition } from "@/lib/motion";

interface HoverLinkProps {
  href: string;
  className?: string;
  /** Motion target applied on hover. Defaults to fading the text to full fg. */
  whileHover?: TargetAndTransition;
  /** Anchor target (e.g. "_blank" for external social links). */
  target?: string;
  /** rel attribute; defaults to a safe value when target is "_blank". */
  rel?: string;
  "aria-label"?: string;
  children: ReactNode;
}

/** Anchor whose hover feedback runs through motion/react (per the project's
 *  "no CSS/Tailwind transitions" mandate). A small client leaf so server-rendered
 *  sections can keep a motion-driven hover without becoming Client Components. */
export const HoverLink = ({
  href,
  className = "",
  whileHover = { color: "var(--fg)" },
  target,
  rel,
  "aria-label": ariaLabel,
  children,
}: HoverLinkProps) => (
  <motion.a
    href={href}
    className={className}
    whileHover={whileHover}
    transition={hoverColorTransition}
    target={target}
    rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
    aria-label={ariaLabel}
  >
    {children}
  </motion.a>
);
