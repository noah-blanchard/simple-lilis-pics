"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { BentoCard } from "@/components/BentoCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/sections/Footer";
import type { ResolvedProject } from "@/types/db";

// Desktop bento rhythm (lg+). Mostly tall 1×2 tiles with sparse wide/extra-tall
// accents so `grid-flow-dense` backfills cleanly without leaving holes.
const BENTO_PATTERN = [
  "lg:col-span-2 lg:row-span-2",
  "lg:row-span-2",
  "lg:row-span-3",
  "lg:col-span-2 lg:row-span-2",
  "lg:row-span-2",
  "lg:row-span-2",
  "lg:col-span-2 lg:row-span-3",
  "lg:row-span-2",
  "lg:row-span-2",
  "lg:col-span-2 lg:row-span-2",
  "lg:row-span-3",
  "lg:row-span-2",
];

// Every tile is a tall 1×2 on phone/tablet; every 5th gets a wide accent so the
// 2-column mobile bento keeps some variety.
const baseSpan = (i: number) =>
  i % 5 === 0 ? "col-span-2 row-span-2 sm:col-span-1" : "col-span-1 row-span-2";

interface PortfolioBentoProps {
  items: ResolvedProject[];
}

export const PortfolioBento = ({ items }: PortfolioBentoProps) => {
  const t = useTranslations("portfolio");

  console.log("items", items);

  return (
    <main className="min-h-screen bg-ink text-fg">
      {/* Slim header (this route has no Hero/NavBar of its own) */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="flex items-center justify-between px-6 pt-8 md:px-12"
      >
        <Link
          href="/"
          className="font-semibold text-[22px] italic tracking-tight"
        >
          <span>Lilis</span>
          <span className="text-accent">.</span>
          <span>Pics</span>
        </Link>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 font-medium text-[14px] text-fg/80 transition-colors hover:bg-inverse hover:text-on-inverse"
          >
            <span aria-hidden>←</span>
            <span>{t("backHome")}</span>
          </Link>
        </div>
      </motion.header>

      <section className="px-6 py-20 md:px-12 md:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <TagLabel>{t("allTag")}</TagLabel>
              <h2
                className="display mt-3 text-4xl md:text-6xl"
                style={{ textWrap: "balance" }}
              >
                {t("allTitle")}
              </h2>
            </div>
            <span className="tag-mono text-fg/45 uppercase">
              {items.length} {t("worksLabel")}
            </span>
          </div>
        </Reveal>

        <div className="grid grid-flow-dense auto-rows-[11rem] grid-cols-2 gap-4 sm:auto-rows-[13rem] md:grid-cols-3 md:gap-5 lg:auto-rows-[15rem] lg:grid-cols-4">
          {items.map((project, i) => (
            <BentoCard
              key={project.id}
              project={project}
              index={i}
              spanClassName={`${baseSpan(i)} ${BENTO_PATTERN[i % BENTO_PATTERN.length]}`}
              priority={i < 4}
            />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
};
