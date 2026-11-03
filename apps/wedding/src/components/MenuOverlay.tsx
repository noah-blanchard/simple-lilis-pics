"use client";

import { EASE } from "@lili/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { INSTAGRAM_HREF } from "@/data/nav";
import { HoverLink } from "./HoverLink";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MenuToggle } from "./MenuToggle";
import { NavList } from "./NavList";

interface MenuOverlayProps {
  open: boolean;
  onClose: () => void;
}

// Adapted from apps/web: full-screen circle-wipe menu. No film strip and no
// decoration; the middle row is only the link list.
export const MenuOverlay = ({ open, onClose }: MenuOverlayProps) => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

  // Portal target only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Esc closes, body scroll is locked, focus moves to the first link.
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
      ?.querySelector<HTMLAnchorElement>("ul a")
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
          className="fixed inset-0 z-[var(--z-menu)] flex flex-col bg-ink text-fg"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: reduce ? 0.25 : 0.6, ease: EASE }}
        >
          <div className="flex items-center justify-between px-6 pt-8 md:px-12">
            <Logo alt={t("logoAlt")} />
            <MenuToggle
              open
              onToggle={onClose}
              openLabel={t("menu")}
              closeLabel={t("close")}
            />
          </div>

          <div className="flex flex-1 items-center overflow-y-auto px-6 py-6 md:px-12">
            <NavList onNavigate={onClose} />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.5, duration: 0.5, ease: EASE }}
            className="flex flex-col gap-5 border-fg/10 border-t px-6 py-8 md:flex-row md:items-center md:justify-between md:px-12"
          >
            <HoverLink
              href={INSTAGRAM_HREF}
              target="_blank"
              className="text-[14px] text-fg/65"
            >
              {/* Instagram label stays a brand name in both languages. */}
              Instagram
            </HoverLink>
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
