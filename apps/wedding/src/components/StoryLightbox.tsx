"use client";

import { ZoomableImage } from "@lili/ui/components/ZoomableImage";
import { EASE } from "@lili/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TextLink } from "./TextLink";

interface StoryLightboxProps {
  photos: { id: string; img: string }[];
  /** Index of the open photograph, or null when closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
  label: string;
  alt: string;
}

/** Full-screen viewer on the night table. Words for controls, no arrows. */
export const StoryLightbox = ({
  photos,
  index,
  onIndexChange,
  label,
  alt,
}: StoryLightboxProps) => {
  const t = useTranslations("stories.lightbox");
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dialogRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const open = index !== null;
  const total = photos.length;

  const go = useCallback(
    (dir: number) => {
      onIndexChange(index === null ? null : (index + dir + total) % total);
    },
    [index, total, onIndexChange],
  );
  const close = useCallback(() => onIndexChange(null), [onIndexChange]);

  // Keys, scroll lock, focus in and back out, and a Tab trap.
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("button")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "Tab") {
        const focusable =
          dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      opener.current?.focus();
    };
  }, [open, close, go]);

  if (!mounted) return null;
  const photo = index === null ? null : photos[index];

  return createPortal(
    <AnimatePresence>
      {open && photo && index !== null && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          data-tone="night"
          className="fixed inset-0 z-[var(--z-overlay)] flex flex-col bg-ink text-fg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduce ? { duration: 0 } : { duration: 0.3, ease: EASE }}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <p className="text-[13px] text-muted">
              {t("counter", { current: index + 1, total })}
            </p>
            <TextLink onClick={close}>{t("close")}</TextLink>
          </div>
          <div className="relative min-h-0 flex-1">
            <ZoomableImage
              src={photo.img}
              alt={alt}
              resetKey={photo.id}
              sizes="100vw"
              onSwipe={go}
            />
          </div>
          <div className="flex items-center justify-center gap-10 px-6 py-5">
            <TextLink onClick={() => go(-1)}>{t("previous")}</TextLink>
            <TextLink onClick={() => go(1)}>{t("next")}</TextLink>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
