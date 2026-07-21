"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { AccentUnderline } from "@/components/AccentUnderline";
import { BentoCard } from "@/components/BentoCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { navTextControl } from "@/components/nav/navControl";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { Link } from "@/i18n/navigation";
import { packColumns, useColumnCount } from "@/lib/bento";
import { EASE, hoverColorTransition } from "@/lib/motion";
import { Footer } from "@/sections/Footer";
import type { ResolvedProject } from "@/types/db";

const MotionLink = motion.create(Link);

const navHover = {
  backgroundColor: "var(--inverse)",
  color: "var(--on-inverse)",
} as const;

interface PortfolioBentoProps {
  items: ResolvedProject[];
}

export const PortfolioBento = ({ items }: PortfolioBentoProps) => {
  const t = useTranslations("portfolio");
  const cols = useColumnCount();
  const columns = packColumns(items, cols);

  // Flat index per item for stagger delay (stable across re-renders).
  const flatIndex = new Map<string, number>();
  let i = 0;
  for (const col of columns) {
    for (const item of col) {
      flatIndex.set(item.id, i++);
    }
  }

  return (
    <main className="min-h-screen bg-ink text-fg">
      {/* Slim header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
        className="container-site flex items-center justify-between pt-8"
      >
        <Logo />
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <MotionLink
            href="/"
            className={navTextControl}
            whileHover={navHover}
            transition={hoverColorTransition}
          >
            <span aria-hidden>←</span>
            <span>{t("backHome")}</span>
          </MotionLink>
        </div>
      </motion.header>

      <section className="container-site py-20 md:py-28 2xl:py-36">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <TagLabel>{t("allTag")}</TagLabel>
              <h2
                className="display mt-3 text-4xl md:text-6xl min-[1440px]:text-h2b-fluid"
                style={{ textWrap: "balance" }}
              >
                <span>{t("allTitleBase")}</span>{" "}
                <AccentUnderline className="text-accent italic">
                  {t("allTitleAccent")}
                </AccentUnderline>
              </h2>
            </div>
            <span className="tag-mono text-fg/45 uppercase">
              {items.length} {t("worksLabel")}
            </span>
          </div>
        </Reveal>

        {/* Aspect-matched masonry: equal-width columns, covers at true ratio */}
        <div className="flex gap-4 md:gap-5">
          {columns.map((col) => (
            <div
              key={col[0]?.id ?? "empty"}
              className="flex min-w-0 flex-1 flex-col gap-4 md:gap-5"
            >
              {col.map((project) => (
                <BentoCard
                  key={project.id}
                  project={project}
                  index={flatIndex.get(project.id) ?? 0}
                  priority={(flatIndex.get(project.id) ?? 99) < 3}
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
};
