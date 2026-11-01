"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { EASE } from "@/lib/motion";

// Curated editorial/portrait photography, optimized for web (WebP, resized
// to the carousel's max display width).
const SLIDES = [
  "/hero-carousel/portrait-photo-01.webp",
  "/hero-carousel/portrait-photo-02.webp",
  "/hero-carousel/portrait-photo-03.webp",
  "/hero-carousel/portrait-photo-04.webp",
  "/hero-carousel/portrait-photo-05.webp",
];

const AUTOPLAY_MS = 5500;

interface HeroCarouselProps {
  className?: string;
}

// Big autoplay image carousel for the Hero's right column. Pauses on hover,
// exposes numbered pagination tabs for a direct jump. Modeled on the slide
// pattern in ProjectGallery (index/direction tuple, AnimatePresence popLayout).
export const HeroCarousel = ({ className = "" }: HeroCarouselProps) => {
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const count = SLIDES.length;

  const [[index, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const paginate = useCallback(
    (dir: number) => {
      setState(([prev]) => [(prev + dir + count) % count, dir]);
    },
    [count],
  );

  const goTo = useCallback((i: number) => {
    setState(([prev]) => [i, i > prev ? 1 : -1]);
  }, []);

  // Autoplay; resets whenever the index changes (including manual jumps) so a
  // pagination click isn't immediately overridden by a stale timer.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `index` is unused in the body but intentionally re-arms the timer on every change
  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, paginate, index]);

  const slideVariants = {
    enter: (dir: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? 60 : -60 },
    center: { opacity: 1, x: 0 },
    exit: (dir: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: dir > 0 ? -60 : 60 },
  };

  return (
    <motion.div
      className={`flex flex-col ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* aspect-[2/3] mirrors the source photos' own portrait ratio (roughly
          9:16, softened toward a cleaner fraction). On mobile it's width-
          driven and full-bleed; on desktop the height instead fills
          whatever the flex column has left (md:h-0 + md:flex-1) and width
          is derived from the ratio via md:self-end, which keeps the box
          from stretching to the full grid column and pins the now-thinner
          carousel to the right edge. */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-card bg-panel md:h-0 md:min-h-0 md:w-auto md:flex-1 md:self-end">
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDES[index]}
              alt={t("carousel.alt", { n: index + 1, total: count })}
              fill
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, 35vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-5 md:justify-end">
        {SLIDES.map((_, i) => (
          <button
            // biome-ignore lint/suspicious/noArrayIndexKey: static slide list, order never changes
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={t("carousel.goTo", { n: i + 1 })}
            aria-current={i === index}
            className="relative cursor-pointer pb-2"
          >
            <motion.span
              className={`tag-mono ${i === index ? "text-accent" : "text-muted"}`}
              animate={{ opacity: i === index ? 1 : 0.55 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {String(i + 1).padStart(2, "0")}
            </motion.span>
            {i === index && (
              <motion.span
                layoutId="hero-carousel-active-tab"
                className="absolute inset-x-0 bottom-0 h-px bg-accent"
                transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};
