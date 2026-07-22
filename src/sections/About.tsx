"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AboutBioModal } from "@/components/AboutBioModal";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { RoundedImage } from "@/components/RoundedImage";
import { SectionHeader } from "@/components/SectionHeader";
import { rawList } from "@/lib/messages";
import { hoverColorTransition } from "@/lib/motion";

const ABOUT_IMG = "/about/about_landscape.webp";

export const About = () => {
  const t = useTranslations("about");
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 90 });

  const openBio = (e: React.MouseEvent<HTMLButtonElement>) => {
    const hasPointerCoords = e.clientX !== 0 || e.clientY !== 0;
    const { x, y } = hasPointerCoords
      ? { x: e.clientX, y: e.clientY }
      : (() => {
          const rect = e.currentTarget.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        })();
    setOrigin({
      x: (x / window.innerWidth) * 100,
      y: (y / window.innerHeight) * 100,
    });
    setOpen(true);
  };

  return (
    <section id="about" className="container-site section-y">
      <SectionHeader
        titleBase={t("titleBase")}
        titleAccent={t("titleAccent")}
      />
      <div className="mt-16 grid grid-cols-1 items-stretch gap-6 md:grid-cols-12 2xl:mt-24">
        <Reveal className="md:col-span-8">
          <RoundedImage
            ratio="aspect-[16/9]"
            src={ABOUT_IMG}
            sizes="(max-width: 768px) 100vw, 66vw"
            layoutId={open ? undefined : "about-photo"}
          >
            <div className="pointer-events-none absolute right-5 bottom-5 md:right-6 md:bottom-6">
              <Logo className="h-8 opacity-30 drop-shadow-md md:h-10" />
            </div>
          </RoundedImage>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col justify-end md:col-span-4">
          <p className="max-w-[420px] text-[15px] text-fg/75 leading-relaxed md:text-[16px] min-[1440px]:text-body-fluid">
            {t("body")}
          </p>
          <motion.button
            type="button"
            onClick={openBio}
            className="mt-8 inline-flex items-center gap-2 text-fg"
            whileHover={{ color: "var(--accent-strong)" }}
            transition={hoverColorTransition}
          >
            <span className="font-medium">{t("readMore")}</span>
            <span aria-hidden>→</span>
          </motion.button>
        </Reveal>
      </div>

      <AboutBioModal
        open={open}
        onClose={() => setOpen(false)}
        photoSrc={ABOUT_IMG}
        photoAlt={t("titleBase")}
        paragraphs={rawList(t, "bio")}
        origin={origin}
      />
    </section>
  );
};
