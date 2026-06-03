"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { MenuOverlay } from "./MenuOverlay";
import { MenuToggle } from "./MenuToggle";

export const NavBar = () => {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="relative z-20 flex items-center justify-between px-6 pt-8 md:px-12"
      >
        {/* Brand mark (logotype — not translated) */}
        <a href="#" className="font-semibold text-[22px] italic tracking-tight">
          <span>Lilis</span>
          <span className="text-accent">.</span>
          <span>Pics</span>
        </a>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
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
