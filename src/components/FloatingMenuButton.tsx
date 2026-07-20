"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";
import { MenuOverlay } from "./MenuOverlay";
import { MenuToggle } from "./MenuToggle";

// True once viewport width crosses the `md` breakpoint (768px), the same
// threshold the rest of the app uses to switch layouts. Resolved in a layout
// effect (before paint) rather than a regular effect, so the homepage's
// desktop-hero-hide behavior doesn't flash the button visible for a frame.
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  useLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isDesktop;
};

// Site-wide floating nav trigger, mounted once at the locale layout level so
// it's present on every route — the Hero was previously the only place that
// hosted any navigation at all. On the homepage it stays hidden (desktop
// only) while the Hero is in view, since the Hero already shows the nav
// index inline there, and fades in once scrolled past. On every other route,
// and on mobile everywhere (the Hero has no inline nav rail there), it's
// always visible.
export const FloatingMenuButton = () => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isDesktop = useIsDesktop();

  const [open, setOpen] = useState(false);
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    if (!isHome) return;
    const hero = document.getElementById("hero");
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [isHome]);

  const visible = !isHome || !isDesktop || !heroInView;

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -12 }}
            transition={{ duration: reduce ? 0.25 : 0.4, ease: EASE }}
            className="fixed top-6 right-6 z-[var(--z-nav)] rounded-full shadow-lg md:top-8 md:right-8"
          >
            <MenuToggle
              variant="light"
              open={open}
              onToggle={() => setOpen((o) => !o)}
              openLabel={t("menu")}
              closeLabel={t("close")}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
};
