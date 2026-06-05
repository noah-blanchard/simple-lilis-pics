"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { GalleryIntro } from "@/components/GalleryIntro";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { TagLabel } from "@/components/TagLabel";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link, useRouter } from "@/i18n/navigation";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { PillButton } from "./PillButton";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProjectGalleryProps {
  project: ResolvedProject;
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const t = useTranslations("portfolio");
  const tNav = useTranslations("nav");
  const prefersReduced = useReducedMotion();
  const router = useRouter();
  const photos = project.photos;
  const count = photos.length;

  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  // Opening intro: hold a title card until the first photo has decoded so the
  // user never sees an empty frame. `ready` gates the intro's exit.
  const [imgLoaded, setImgLoaded] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const ready = imgLoaded && minElapsed;

  useEffect(() => {
    // Floor the intro so it can't flash for cached images...
    const min = setTimeout(() => setMinElapsed(true), 450);
    // ...and a ceiling so a slow/failed load never traps the user behind it.
    const max = setTimeout(() => setImgLoaded(true), 4000);
    return () => {
      clearTimeout(min);
      clearTimeout(max);
    };
  }, []);

  // Closing: recede the gallery, then navigate once the exit settles so the
  // grid never pops in mid-animation.
  const [closing, setClosing] = useState(false);
  const handleClose = useCallback(() => setClosing(true), []);

  const paginate = useCallback(
    (dir: number) => {
      setState(([prev]) => {
        const next = (prev + dir + count) % count;
        return [next, dir];
      });
    },
    [count],
  );

  // Keyboard navigation
  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paginate, count]);

  const photo = photos[index];
  const title = project.title || t("untitled");

  // Slide + fade transition; respects reduced motion.
  const slideVariants = {
    enter: (dir: number) =>
      prefersReduced ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? 80 : -80 },
    center: { opacity: 1, x: 0 },
    exit: (dir: number) =>
      prefersReduced ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? -80 : 80 },
  };

  return (
    <>
      <AnimatePresence>
        {!ready && <GalleryIntro title={title} />}
      </AnimatePresence>

      <motion.div
        className="fixed inset-0 flex flex-col bg-ink text-fg"
        animate={
          closing
            ? { opacity: 0, scale: prefersReduced ? 1 : 0.97 }
            : { opacity: 1, scale: 1 }
        }
        transition={{ duration: 0.4, ease: EASE }}
        onAnimationComplete={() => {
          if (closing) router.back();
        }}
      >
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="/"
            className="font-semibold text-[20px] italic tracking-tight"
          >
            <span>Lilis</span>
            <span className="text-accent">.</span>
            <span>Pics</span>
          </Link>

          <div className="flex items-center gap-3">
            {count > 1 && (
              <span className="tag-mono text-fg/60 tabular-nums">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(count).padStart(2, "0")}
              </span>
            )}
            <LocaleSwitcher />
            <ThemeToggle
              toLightLabel={tNav("theme.toLight")}
              toDarkLabel={tNav("theme.toDark")}
            />
            <PillButton
              size="sm"
              onClick={handleClose}
              variant="danger"
              className="shrink-0"
            >
              ✕
            </PillButton>
          </div>
        </header>

        {/* ── Stage ── */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            <motion.div
              key={photo.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE }}
              className="relative flex h-full w-full items-center justify-center"
            >
              {/* object-contain so the full photo is always visible (no crop) */}
              <Image
                src={photo.img}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgLoaded(true)}
              />
            </motion.div>
          </AnimatePresence>

          {/* ── Prev / Next arrows ── */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous photo"
                className="-translate-y-1/2 absolute top-1/2 left-3 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur transition-colors hover:bg-inverse hover:text-on-inverse md:left-6"
              >
                <IconArrow className="h-5 w-5 rotate-225" />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next photo"
                className="-translate-y-1/2 absolute top-1/2 right-3 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur transition-colors hover:bg-inverse hover:text-on-inverse md:right-6"
              >
                <IconArrow className="h-5 w-5 rotate-45" />
              </button>
            </>
          )}
        </div>

        {/* ── Persistent info overlay ── */}
        <footer className="px-6 pt-4 pb-6 md:px-10 md:pb-8">
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div className="min-w-0">
              {project.tags && (
                <TagLabel className="mb-2 block text-fg/60">
                  {project.tags}
                </TagLabel>
              )}
              <h1 className="display font-semibold text-2xl text-fg tracking-tight md:text-4xl">
                {title}
              </h1>
              {project.description && (
                <p className="mt-2 max-w-prose text-[14px] text-fg/60">
                  {project.description}
                </p>
              )}
            </div>
            {project.year && (
              <span className="tag-mono shrink-0 text-fg/45">
                {project.year}
              </span>
            )}
          </div>

          {/* ── Thumbnail strip ── */}
          {count > 1 && (
            <div className="mt-5 flex gap-2.5">
              {photos.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setState([i, i > index ? 1 : -1])}
                  aria-label={`Go to photo ${i + 1}`}
                  className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                    i === index
                      ? "border-accent opacity-100"
                      : "border-line opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={p.img}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </footer>
      </motion.div>
    </>
  );
}
