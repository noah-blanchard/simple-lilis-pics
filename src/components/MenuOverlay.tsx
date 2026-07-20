"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { navItems } from "@/data/nav";
import { Link } from "@/i18n/navigation";
import { rawList } from "@/lib/messages";
import { HoverLink } from "./HoverLink";
import { IconArrow } from "./Icons";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MenuToggle } from "./MenuToggle";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

import { EASE } from "@/lib/motion";

export const MenuOverlay = ({ open, onClose }: MenuOverlayProps) => {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const reduce = useReducedMotion();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Portal target only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    firstLinkRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const socials = rawList(tFooter, "social");

  // Smooth-scroll to a section after closing the overlay.
  const goToAnchor = (target: string) => {
    onClose();
    const id = target.slice(1);
    window.setTimeout(() => {
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const overlayVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { clipPath: "circle(0% at 92% 6%)" },
        visible: { clipPath: "circle(150% at 92% 6%)" },
      };

  const listVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.18 } },
  };
  const itemVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { y: "110%", opacity: 0 },
        visible: { y: "0%", opacity: 1 },
      };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t("menu")}
          className="grain fixed inset-0 z-[var(--z-menu)] flex flex-col bg-ink text-fg"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: reduce ? 0.25 : 0.6, ease: EASE }}
        >
          {/* Top bar — mirrors the NavBar layout; the pill here closes. */}
          <div className="flex items-center justify-between px-6 pt-8 md:px-12">
            <span className="font-semibold text-[22px] italic tracking-tight">
              <span>Lilis</span>
              <span className="text-accent">.</span>
              <span>Pics</span>
            </span>
            <MenuToggle
              open
              onToggle={onClose}
              openLabel={t("menu")}
              closeLabel={t("close")}
            />
          </div>

          {/* Links */}
          <motion.ul
            variants={listVariants}
            className="flex flex-1 flex-col justify-center gap-2 px-6 md:gap-4 md:px-12"
          >
            {navItems.map((item, i) => {
              const label = t(`items.${item.key}`);
              const number = String(i + 1).padStart(2, "0");

              const inner = (
                <>
                  <span className="tag-mono w-9 shrink-0 pt-3 md:pt-5">
                    {number}
                  </span>
                  {/* Label recolours fg → accent by cross-fading two copies
                      (colours are CSS classes so they flip with the theme). */}
                  <span className="display relative text-5xl uppercase leading-none sm:text-6xl md:text-7xl">
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
                    <IconArrow className="h-7 w-7 md:h-9 md:w-9" />
                  </motion.span>
                </>
              );

              const linkClass = "group flex items-start gap-4 md:gap-6 py-1";

              return (
                <motion.li
                  key={item.key}
                  className="overflow-hidden"
                  variants={{ hidden: {}, visible: {} }}
                >
                  <motion.div variants={itemVariants}>
                    {item.type === "route" ? (
                      <motion.div
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        variants={{ rest: {}, hover: {} }}
                      >
                        <Link
                          href={item.target}
                          onClick={onClose}
                          className={linkClass}
                        >
                          {inner}
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.a
                        ref={i === 0 ? firstLinkRef : undefined}
                        href={item.target}
                        onClick={(e) => {
                          e.preventDefault();
                          goToAnchor(item.target);
                        }}
                        className={linkClass}
                        initial="rest"
                        animate="rest"
                        whileHover="hover"
                        variants={{ rest: {}, hover: {} }}
                      >
                        {inner}
                      </motion.a>
                    )}
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.5, ease: EASE }}
            className="flex flex-col gap-5 border-fg/10 border-t px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {socials.map((name) => (
                <HoverLink
                  key={name}
                  href="#"
                  className="text-[14px] text-fg/65"
                >
                  {name}
                </HoverLink>
              ))}
            </div>
            <div className="flex items-center gap-6">
              <HoverLink
                href={`mailto:${t("email")}`}
                className="text-[14px] text-fg/65"
              >
                {t("email")}
              </HoverLink>
              <LocaleSwitcher />
              <HoverLink href="/admin" className="text-[14px] text-fg/65">
                {t("dashboard")}
              </HoverLink>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
