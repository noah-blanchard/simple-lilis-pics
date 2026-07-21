"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { navItems } from "@/data/nav";
import { Link, usePathname } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";
import {
  isInPageAnchor,
  resolveNavHref,
  smoothScrollToAnchor,
} from "@/lib/navTarget";
import { IconArrow } from "./Icons";

interface NavIndexListProps {
  /** Called after a link is activated — e.g. to close a hosting overlay. Omit for inline use. */
  onNavigate?: () => void;
  /** "lg" = fullscreen overlay scale, "md" = compact inline-hero scale. */
  size?: "lg" | "md";
  /** Stagger start delay (seconds). */
  delayChildren?: number;
  /** Self-run the entrance instead of inheriting variant state from a
   *  motion.div ancestor (e.g. MenuOverlay's dialog). Use for standalone
   *  placement like the Hero rail. */
  standalone?: boolean;
  className?: string;
}

const sizeConfig = {
  lg: {
    gap: "gap-1 md:gap-3",
    row: "gap-2 md:gap-5 py-1",
    number: "w-6 pt-1.5 md:w-7 md:pt-3",
    label: "text-3xl sm:text-4xl md:text-5xl",
    arrow: "h-5 w-5 md:h-7 md:w-7",
  },
  md: {
    gap: "gap-1.5 md:gap-2.5",
    row: "gap-3 md:gap-4 py-0.5",
    number: "w-7 pt-1 md:pt-1.5",
    label: "text-2xl md:text-3xl",
    arrow: "h-5 w-5 md:h-6 md:w-6",
  },
} as const;

// Shared numbered nav-link list — the same markup, hover treatment (fg → accent
// cross-fade + arrow slide-in) and entrance stagger power both the fullscreen
// MenuOverlay and the Hero's inline rail, so styling can't drift between them.
export const NavIndexList = ({
  onNavigate,
  size = "lg",
  delayChildren = 0.18,
  standalone = false,
  className = "",
}: NavIndexListProps) => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();
  const cfg = sizeConfig[size];
  const pathname = usePathname();
  const isHome = pathname === "/";

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren } },
  };
  const itemVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: "110%", opacity: 0 },
        visible: { y: "0%", opacity: 1 },
      };

  return (
    <motion.ul
      variants={listVariants}
      {...(standalone ? { initial: "hidden", animate: "visible" } : {})}
      className={`flex flex-col ${cfg.gap} ${className}`}
    >
      {navItems.map((item, i) => {
        const label = t(`items.${item.key}`);
        const number = String(i + 1).padStart(2, "0");

        const inner = (
          <>
            <span className={`tag-mono shrink-0 ${cfg.number}`}>{number}</span>
            {/* Label recolours fg → accent by cross-fading two copies
                (colours are CSS classes so they flip with the theme). */}
            <span
              className={`display relative uppercase leading-none ${cfg.label}`}
            >
              <motion.span
                variants={{ rest: { opacity: 1 }, hover: { opacity: 0 } }}
                transition={{ duration: 0.3, ease: EASE }}
                className="block text-fg"
              >
                {label}
              </motion.span>
              <motion.span
                aria-hidden
                variants={{ rest: { opacity: 0 }, hover: { opacity: 1 } }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-0 text-accent"
              >
                {label}
              </motion.span>
            </span>
            <motion.span
              aria-hidden
              variants={{
                rest: { opacity: 0, x: -12 },
                hover: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.3, ease: EASE }}
              className="self-center text-accent"
            >
              <IconArrow className={cfg.arrow} />
            </motion.span>
          </>
        );

        const linkClass = `group flex items-start ${cfg.row}`;
        // Anchor items only resolve on the homepage; from any other page they
        // become a real navigation to `/#id` instead of silently no-op-ing.
        const isAnchor = isInPageAnchor(item, isHome);

        return (
          <motion.li
            key={item.key}
            className="overflow-hidden"
            variants={{ hidden: {}, visible: {} }}
          >
            <motion.div variants={itemVariants}>
              {isAnchor ? (
                <motion.a
                  href={item.target}
                  onClick={(e) => {
                    e.preventDefault();
                    smoothScrollToAnchor(item.target, onNavigate);
                  }}
                  className={linkClass}
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  variants={{ rest: {}, hover: {} }}
                >
                  {inner}
                </motion.a>
              ) : (
                <motion.div
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  variants={{ rest: {}, hover: {} }}
                >
                  <Link
                    href={resolveNavHref(item, isHome)}
                    onClick={onNavigate}
                    className={linkClass}
                  >
                    {inner}
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};
