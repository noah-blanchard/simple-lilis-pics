"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { HeroCarousel } from "@/components/HeroCarousel";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { NavBar } from "@/components/NavBar";
import { NavIndexList } from "@/components/NavIndexList";
import { PillButton } from "@/components/PillButton";
import { TagLabel } from "@/components/TagLabel";
import { Link } from "@/i18n/navigation";
import { EASE } from "@/lib/motion";

// Splits a translated line on `**word**` markers and renders the marked
// portion in accent color. Word position differs by language (e.g. the
// accent word lands first in English but last in French), so the marker
// lives in the translation string itself rather than in separate ordered
// keys.
const renderAccentLine = (text: string) =>
  text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: static translation text, order never changes
      <span key={i} className="text-accent italic">
        {part}
      </span>
    ) : (
      part
    ),
  );

export const Hero = () => {
  const t = useTranslations("hero");

  return (
    <section id="hero" className="relative w-full overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 z-[var(--z-base)]" />

      {/* Mobile-only top bar (logo, locale, menu trigger) — temporary until
          FloatingMenuButton takes over site-wide nav in the next step. */}
      <div className="md:hidden">
        <NavBar />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 gap-x-12 gap-y-10 px-6 pt-6 pb-16 md:min-h-[100svh] md:grid-cols-12 md:items-center md:px-12 md:py-10">
        {/* Left column — brand, nav, headline, CTA */}
        <div className="flex flex-col md:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="hidden items-center justify-between md:flex"
          >
            <Link
              href="/"
              className="font-semibold text-[22px] italic tracking-tight"
            >
              <span>Lilis</span>
              <span className="text-accent">.</span>
              <span>Pics</span>
            </Link>
            <LocaleSwitcher />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
            className="mt-6 flex items-center gap-6 md:mt-10"
          >
            <TagLabel>{t("byline")}</TagLabel>
            <TagLabel>{t("location")}</TagLabel>
          </motion.div>

          <div className="mt-6 hidden md:block">
            <NavIndexList size="md" standalone delayChildren={0.45} />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: EASE }}
            className="display-xl mt-8 max-w-[560px] text-[40px] uppercase leading-[0.95] sm:text-6xl md:mt-10 md:text-[52px] lg:text-[64px]"
            style={{ textWrap: "balance" }}
          >
            <span className="block">{renderAccentLine(t("titleLine1"))}</span>
            <span className="block">{renderAccentLine(t("titleLine2"))}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7, ease: EASE }}
            className="mt-6 max-w-[440px] text-[15px] text-fg/75 leading-relaxed md:text-[17px]"
          >
            {t("intro")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.85, ease: EASE }}
            className="mt-8"
          >
            <PillButton href="#contact" variant="light">
              {t("cta")}
            </PillButton>
          </motion.div>
        </div>

        {/* Right column — big autoplay carousel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          className="md:col-span-7"
        >
          <HeroCarousel />
        </motion.div>
      </div>
    </section>
  );
};
