"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { EASE } from "@/lib/motion";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MenuOverlay } from "./MenuOverlay";
import { MenuToggle } from "./MenuToggle";
import { ThemeToggle } from "./theme/ThemeToggle";

export const NavBar = () => {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
        className="relative z-[var(--z-nav)] mx-auto flex max-w-[1440px] items-center justify-between px-6 pt-8 md:px-12"
      >
        {/* Brand mark (logotype — not translated) */}
        <a href="#" className="font-semibold text-[22px] italic tracking-tight">
          <span>Lilis</span>
          <span className="text-accent">.</span>
          <span>Pics</span>
        </a>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <ThemeToggle
            toLightLabel={t("theme.toLight")}
            toDarkLabel={t("theme.toDark")}
          />
          <MenuToggle
            open={open}
            onToggle={() => setOpen((o) => !o)}
            openLabel={t("menu")}
            closeLabel={t("close")}
          />
        </div>
      </motion.header>

      <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
};
