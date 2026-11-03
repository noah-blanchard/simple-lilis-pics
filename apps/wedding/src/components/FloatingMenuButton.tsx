"use client";

import { EASE } from "@lili/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { useMenu } from "./MenuProvider";
import { MenuToggle } from "./MenuToggle";

// Adapted from apps/web: a floating Menu pill on every route. It shows once the
// logo row (#page-top) has scrolled away, and hides while the overlay is open.
export const FloatingMenuButton = () => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();
  const pathname = usePathname();
  const { open, toggle } = useMenu();
  const [topInView, setTopInView] = useState(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-observe when the route changes, since #page-top is a different element per page.
  useEffect(() => {
    const top = document.getElementById("page-top");
    if (!top) {
      setTopInView(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setTopInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(top);
    return () => observer.disconnect();
  }, [pathname]);

  const visible = !topInView && !open;

  return (
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
            onToggle={toggle}
            openLabel={t("menu")}
            closeLabel={t("close")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
