"use client";

import { EASE } from "@lili/ui/lib/motion";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { navItems, portfolioHref } from "@/data/nav";
import { Link, usePathname } from "@/i18n/navigation";
import {
  isInPageAnchor,
  resolveNavHref,
  smoothScrollToAnchor,
} from "@/lib/navTarget";

interface NavListProps {
  /** Called after a link is activated, e.g. to close the menu. */
  onNavigate?: () => void;
  className?: string;
}

const LINK = "group block py-1";
const LABEL =
  "display relative block text-4xl leading-tight sm:text-5xl md:text-6xl";

// Adapted from apps/web's NavIndexList: same hover cross-fade (fg to accent) and
// entrance stagger, without the number column or the arrow (design decision D3).
export const NavList = ({ onNavigate, className = "" }: NavListProps) => {
  const t = useTranslations("nav");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const isHome = usePathname() === "/";

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
  };
  const itemVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : { hidden: { y: "110%", opacity: 0 }, visible: { y: "0%", opacity: 1 } };
  const hoverVariants = { rest: {}, hover: {} };

  return (
    <motion.ul
      variants={listVariants}
      className={`flex flex-col gap-1 md:gap-2 ${className}`}
    >
      {navItems.map((item) => {
        const label = t(`items.${item.key}`);
        const inner = (
          <span className={LABEL}>
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
        );

        let link: React.ReactNode;
        if (item.type === "external") {
          link = (
            <motion.a
              href={portfolioHref(locale)}
              target="_blank"
              rel="noopener noreferrer"
              className={LINK}
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={hoverVariants}
            >
              {inner}
            </motion.a>
          );
        } else if (isInPageAnchor(item, isHome)) {
          link = (
            <motion.a
              href={item.target}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollToAnchor(item.target, onNavigate);
              }}
              className={LINK}
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={hoverVariants}
            >
              {inner}
            </motion.a>
          );
        } else {
          link = (
            <motion.div
              initial="rest"
              animate="rest"
              whileHover="hover"
              variants={hoverVariants}
            >
              <Link
                href={resolveNavHref(item, isHome)}
                onClick={onNavigate}
                className={LINK}
              >
                {inner}
              </Link>
            </motion.div>
          );
        }

        return (
          <motion.li
            key={item.key}
            className="overflow-hidden"
            variants={{ hidden: {}, visible: {} }}
          >
            <motion.div variants={itemVariants}>{link}</motion.div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
};
