"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { GalleryIntro } from "@/components/GalleryIntro";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Logo } from "@/components/Logo";
import { TagLabel } from "@/components/TagLabel";
import { ZoomableImage } from "@/components/ZoomableImage";
import { useRouter } from "@/i18n/navigation";
import { EASE, hoverColorTransition } from "@/lib/motion";
import type { ResolvedProject } from "@/types/db";
import { IconArrow } from "./Icons";
import { PillButton } from "./PillButton";

const navBtnHover = {
  backgroundColor: "var(--inverse)",
  color: "var(--on-inverse)",
} as const;

interface ProjectGalleryProps {
  project: ResolvedProject;
}

export function ProjectGallery({ project }: ProjectGalleryProps) {
  const t = useTranslations("portfolio");
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

  // Chrome (top bar / info / thumbnails) can be hidden to view the photo alone.
  const [showChrome, setShowChrome] = useState(true);

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
        className="fixed inset-0 bg-ink text-fg"
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
        {/* ── Full-bleed image stage ── */}
        <div className="absolute inset-0">
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            <motion.div
              key={photo.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: EASE }}
              className="absolute inset-0"
            >
              {/* object-contain so the full photo is always visible (no crop);
                  ZoomableImage adds scroll/pinch zoom + drag-pan, scoped to the
                  image, plus basic download deterrence. */}
              <ZoomableImage
                src={photo.img}
                alt={title}
                resetKey={photo.id}
                sizes="100vw"
                priority
                onLoaded={() => setImgLoaded(true)}
                onTap={() => setShowChrome((v) => !v)}
                onSwipe={count > 1 ? paginate : undefined}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Chrome: scrims + nav + info, hideable to view the photo alone.
            Wrapper is click-through; interactive children opt back in with
            pointer-events-auto. `inert` fully disables it while hidden. ── */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: showChrome ? 1 : 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          inert={!showChrome}
        >
          {/* ── Edge scrims for overlay legibility (don't block gestures) ── */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-ink/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-ink/80 to-transparent" />

          {/* ── Prev / Next arrows ── */}
          {count > 1 && (
            <>
              <motion.button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous photo"
                className="-translate-y-1/2 pointer-events-auto absolute top-1/2 left-3 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur md:left-6"
                whileHover={navBtnHover}
                transition={hoverColorTransition}
              >
                <IconArrow className="h-5 w-5 rotate-225" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next photo"
                className="-translate-y-1/2 pointer-events-auto absolute top-1/2 right-3 inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur md:right-6"
                whileHover={navBtnHover}
                transition={hoverColorTransition}
              >
                <IconArrow className="h-5 w-5 rotate-45" />
              </motion.button>
            </>
          )}

          {/* ── Top bar (overlay) ── */}
          <header className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 md:px-10">
            <Logo className="pointer-events-auto h-8" />

            <div className="pointer-events-auto flex items-center gap-3">
              {count > 1 && (
                <span className="tag-mono text-fg/60 tabular-nums">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </span>
              )}
              <LocaleSwitcher />
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

          {/* ── Persistent info overlay ── */}
          <footer className="pointer-events-none absolute inset-x-0 bottom-0 px-6 pt-4 pb-6 md:px-10 md:pb-8">
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
              <div className="pointer-events-auto mt-5 flex w-fit gap-2.5">
                {photos.map((p, i) => (
                  <motion.button
                    key={p.id}
                    type="button"
                    onClick={() => setState([i, i > index ? 1 : -1])}
                    onContextMenu={(e) => e.preventDefault()}
                    aria-label={`Go to photo ${i + 1}`}
                    className="no-save relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border"
                    animate={{
                      opacity: i === index ? 1 : 0.5,
                      borderColor:
                        i === index ? "var(--accent)" : "var(--line)",
                    }}
                    whileHover={i === index ? undefined : { opacity: 0.8 }}
                    transition={hoverColorTransition}
                  >
                    <Image
                      src={p.img}
                      alt=""
                      fill
                      sizes="64px"
                      draggable={false}
                      className="no-save object-cover"
                      onDragStart={(e) => e.preventDefault()}
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </footer>
        </motion.div>
      </motion.div>
    </>
  );
}
