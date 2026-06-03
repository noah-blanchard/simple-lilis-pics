"use client";

import { motion } from "motion/react";
import { IconMenu } from "./Icons";
import { LocaleSwitcher } from "./LocaleSwitcher";

interface NavBarProps {
  menuLabel: string;
}

export const NavBar = ({ menuLabel }: NavBarProps) => (
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
      <button
        type="button"
        className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-medium text-[14px] text-ink transition-colors hover:bg-accent"
      >
        <IconMenu className="h-5 w-5" />
        <span>{menuLabel}</span>
      </button>
    </div>
  </motion.header>
);
