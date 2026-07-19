"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { BentoCard } from "@/components/BentoCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { navTextControl } from "@/components/nav/navControl";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
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
  const tNav = useTranslations("nav");
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
          <ThemeToggle
            toLightLabel={tNav("theme.toLight")}
            toDarkLabel={tNav("theme.toDark")}
          />
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

      <section className="px-6 py-20 md:px-12 md:py-28">
        <Reveal>
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <TagLabel>{t("allTag")}</TagLabel>
              <h2
                className="display mt-3 text-4xl md:text-6xl"
                style={{ textWrap: "balance" }}
              >
                <span>{t("allTitleBase")}</span>
                <span className="text-accent">{t("allTitleAccent")}</span>
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
