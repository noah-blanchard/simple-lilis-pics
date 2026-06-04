"use client";

import { motion } from "motion/react";
import { IconMoon, IconSun } from "../Icons";
import { useTheme } from "./ThemeProvider";

interface ThemeToggleProps {
  /** aria/title shown when clicking switches to LIGHT (i.e. currently dark). */
  toLightLabel: string;
  /** aria/title shown when clicking switches to DARK (i.e. currently light). */
  toDarkLabel: string;
  className?: string;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const transition = { duration: 0.35, ease: EASE };

export const ThemeToggle = ({
  toLightLabel,
  toDarkLabel,
  className = "",
}: ThemeToggleProps) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? toLightLabel : toDarkLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line text-fg/70 transition-colors hover:text-fg ${className}`}
    >
      <span className="relative block h-4.5 w-4.5">
        {/* Moon = currently dark. Sun = currently light. They cross-fade and
            rotate into each other on toggle. */}
        <motion.span
          aria-hidden
          className="absolute inset-0 grid place-items-center"
          animate={{
            opacity: isDark ? 1 : 0,
            rotate: isDark ? 0 : -90,
            scale: isDark ? 1 : 0.4,
          }}
          transition={transition}
        >
          <IconMoon className="h-[18px] w-[18px]" />
        </motion.span>
        <motion.span
          aria-hidden
          className="absolute inset-0 grid place-items-center"
          animate={{
            opacity: isDark ? 0 : 1,
            rotate: isDark ? 90 : 0,
            scale: isDark ? 0.4 : 1,
          }}
          transition={transition}
        >
          <IconSun className="h-[18px] w-[18px]" />
        </motion.span>
      </span>
    </button>
  );
};
