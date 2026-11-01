"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { AccentUnderline } from "@/components/AccentUnderline";
import { BentoImageGrid } from "@/components/BentoImageGrid";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { navTextControl } from "@/components/nav/navControl";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { BENTO_BREAKPOINTS } from "@/lib/bento";
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
          <div className="hidden md:block">
            <LocaleSwitcher />
          </div>
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
              <h2
                className="display text-4xl md:text-6xl min-[1440px]:text-h2b-fluid"
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

        {/* Exact-aspect bento: landscapes span 2 columns, portraits 1 */}
        <BentoImageGrid
          items={items}
          breakpoints={BENTO_BREAKPOINTS}
          gap={20}
          colSpanFor={(p) =>
            (p.cover?.orientation ?? "landscape") === "landscape" ? 2 : 1
          }
        />
      </section>

      <Footer />
    </main>
  );
};
