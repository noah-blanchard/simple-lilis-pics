"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { socials } from "@/data/socials";
import { EASE } from "@/lib/motion";
import { HoverLink } from "./HoverLink";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MenuToggle } from "./MenuToggle";
import { NavIndexList } from "./NavIndexList";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

export const MenuOverlay = ({ open, onClose }: MenuOverlayProps) => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

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
    document
      .getElementById("site-menu")
      ?.querySelector<HTMLAnchorElement>("a")
      ?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const overlayVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { clipPath: "circle(0% at 92% 6%)" },
        visible: { clipPath: "circle(150% at 92% 6%)" },
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
          {/* Top bar — logo + a toggle that closes the overlay. */}
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
          <NavIndexList
            onNavigate={onClose}
            size="lg"
            className="flex-1 justify-center px-6 md:px-12"
          />

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.5, ease: EASE }}
            className="flex flex-col gap-5 border-fg/10 border-t px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12"
          >
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {socials.map((s) => (
                <HoverLink
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  className="text-[14px] text-fg/65"
                >
                  {s.label}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
