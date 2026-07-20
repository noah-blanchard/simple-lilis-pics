"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { NavBar } from "@/components/NavBar";
import { PillButton } from "@/components/PillButton";
import { TagLabel } from "@/components/TagLabel";
import { EASE } from "@/lib/motion";

const HERO_IMG =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=80&auto=format&fit=crop";

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
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={HERO_IMG}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/30 to-ink/90" />
      </div>
      <div className="grain pointer-events-none absolute inset-0 z-[var(--z-base)]" />

      <NavBar />

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-100px)] max-w-[1440px] flex-col items-center justify-center px-6 text-center md:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className="absolute top-[42%] left-6 hidden md:left-12 md:block"
        >
          <TagLabel>{t("byline")}</TagLabel>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
          className="absolute top-[42%] right-6 hidden md:right-12 md:block"
        >
          <TagLabel>{t("location")}</TagLabel>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: EASE }}
          className="display-xl max-w-[1100px] text-[44px] uppercase sm:text-6xl md:text-8xl lg:text-[120px]"
          style={{ textWrap: "balance" }}
        >
          <span className="block">{renderAccentLine(t("titleLine1"))}</span>
          <span className="block">{renderAccentLine(t("titleLine2"))}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.45, ease: EASE }}
          className="mt-8 max-w-[640px] text-[15px] text-fg/75 leading-relaxed md:text-[17px]"
        >
          {t("intro")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: EASE }}
          className="mt-10"
        >
          <PillButton href="#contact" variant="light">
            {t("cta")}
          </PillButton>
        </motion.div>
      </div>

      {/* mobile-only meta row */}
      <div className="-mt-4 relative z-10 flex justify-between px-6 pb-8 md:hidden">
        <TagLabel>{t("byline")}</TagLabel>
        <TagLabel>{t("location")}</TagLabel>
      </div>
    </section>
  );
};
