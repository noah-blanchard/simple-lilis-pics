"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BentoCard } from "@/components/BentoCard";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { navTextControl } from "@/components/nav/navControl";
import { Reveal } from "@/components/Reveal";
import { TagLabel } from "@/components/TagLabel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { Footer } from "@/sections/Footer";
import type { ResolvedProject } from "@/types/db";

// Portrait covers are ~1.78× taller than landscape for the same column width.
// We use this ratio to estimate column heights for the packing algorithm.
const PORTRAIT_RATIO = 16 / 9; // height = width × ratio
const LANDSCAPE_RATIO = 9 / 16;

/** Distribute items across N columns using a shortest-column-first algorithm.
 *  This preserves reading order within each column and avoids CSS `columns`
 *  (which breaks tab order and motion stagger). */
function packColumns<T extends { cover: { orientation: string } | null }>(
  items: T[],
  cols: number,
): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  const heights: number[] = new Array(cols).fill(0);

  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(item);
    const ratio =
      item.cover?.orientation === "portrait" ? PORTRAIT_RATIO : LANDSCAPE_RATIO;
    heights[shortest] += ratio;
  }

  return columns;
}

function useColumnCount(): number {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setCols(3);
      else if (window.matchMedia("(min-width: 640px)").matches) setCols(2);
      else setCols(1);
    };
    update();
    const mq = window.matchMedia("(min-width: 640px)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return cols;
}

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
          <ThemeToggle
            toLightLabel={tNav("theme.toLight")}
            toDarkLabel={tNav("theme.toDark")}
          />
          <Link href="/" className={navTextControl}>
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
