"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { HeroCarousel } from "@/components/HeroCarousel";
import { HoverLink } from "@/components/HoverLink";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { NavIndexList } from "@/components/NavIndexList";
import { PillButton } from "@/components/PillButton";
import { socials } from "@/data/socials";
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
    <section
      id="hero"
      className="relative w-full overflow-hidden md:flex md:h-[100svh] md:flex-col"
    >
      {/* Top row — logo + locale, full width, pinned above everything else
          (the locale switcher lands directly above the carousel's top-right
          corner since both rows share the same max-width + side padding). */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        className="container-site relative z-10 flex items-center justify-between pt-6 md:pt-8"
      >
        <Logo />
        <LocaleSwitcher />
      </motion.div>

      {/* Main content — fills whatever height remains under the top row. */}
      <div className="container-site relative z-10 grid grid-cols-1 gap-x-12 gap-y-8 pt-8 pb-10 md:min-h-0 md:flex-1 md:grid-cols-12 md:pt-6 md:pb-8">
        {/* Left column — headline pinned to the top, nav rail centered in the
            middle, CTA + socials pinned to the bottom. */}
        <div className="flex flex-col md:col-span-5">
          {/* Top — byline/location, headline, intro */}
          <div className="flex flex-col gap-5">
            {/* <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
              className="flex items-center gap-6"
            >
              <TagLabel>{t("byline")}</TagLabel>
              <TagLabel>{t("location")}</TagLabel>
            </motion.div> */}

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.45, ease: EASE }}
              className="display-xl max-w-[560px] text-[38px] uppercase leading-[1.1] sm:text-[52px] md:text-[42px] lg:text-[52px] min-[1440px]:text-h1-fluid"
              style={{ textWrap: "balance" }}
            >
              <span className="block">{renderAccentLine(t("titleLine1"))}</span>
              <span className="block">{renderAccentLine(t("titleLine2"))}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.55, ease: EASE }}
              className="max-w-[420px] text-[14px] text-fg/75 leading-relaxed md:text-[15px] min-[1440px]:text-body-fluid"
            >
              {t("intro")}
            </motion.p>
          </div>

          {/* Middle — nav rail, vertically centered in the remaining space */}
          <div className="hidden md:flex md:flex-1 md:items-center">
            <NavIndexList size="md" standalone delayChildren={0.65} />
          </div>

          {/* Bottom — CTA + socials */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.05, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-0"
          >
            <PillButton href="#contact" variant="light">
              {t("cta")}
            </PillButton>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {socials.map((s) => (
                <HoverLink
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  className="text-[13px] text-fg/60"
                >
                  {s.label}
                </HoverLink>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column — big autoplay carousel, fills the row's full height
            on desktop so the image + pagination never overflow past view. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: EASE }}
          className="md:col-span-7 md:h-full"
        >
          <HeroCarousel className="md:h-full" />
        </motion.div>
      </div>
    </section>
  );
};
