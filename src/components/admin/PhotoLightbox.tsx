"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconArrow } from "@/components/Icons";
import { ZoomableImage } from "@/components/ZoomableImage";
import { EASE, hoverColorTransition } from "@/lib/motion";

const navBtnHover = {
  backgroundColor: "var(--inverse)",
  color: "var(--on-inverse)",
} as const;

interface PhotoLightboxPhoto {
  key: string;
  src: string;
}

interface PhotoLightboxProps {
  open: boolean;
  photos: PhotoLightboxPhoto[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

/** Fullscreen photo preview for the admin project editor. Portaled to
 *  document.body (like MenuOverlay) rather than rendered in place — it's
 *  opened from inside ProjectForm, which sits inside Modal's animated
 *  dialog panel, and framer-motion leaves a persistent `transform` on
 *  animated elements even at rest, which would otherwise confine this
 *  `fixed inset-0` overlay to the modal's box instead of the viewport. */
export function PhotoLightbox({
  open,
  photos,
  index,
  onIndexChange,
  onClose,
}: PhotoLightboxProps) {
  const count = photos.length;

  // Portal target only exists on the client.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const paginate = useCallback(
    (dir: number) => {
      if (count <= 1) return;
      onIndexChange((((index + dir) % count) + count) % count);
    },
    [count, index, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") paginate(-1);
      else if (e.key === "ArrowRight") paginate(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, paginate]);

  const photo = photos[index];

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && photo && (
        <div className="fixed inset-0 z-(--z-overlay-top)">
          <motion.button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute inset-0 bg-scrim backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="absolute inset-4 overflow-hidden rounded-card md:inset-10"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <ZoomableImage
              src={photo.src}
              alt=""
              resetKey={photo.key}
              sizes="90vw"
              onSwipe={count > 1 ? paginate : undefined}
            />
          </motion.div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink/30 text-[20px] text-fg/80 backdrop-blur transition-colors hover:bg-inverse hover:text-on-inverse md:top-6 md:right-6"
          >
            ×
          </button>

          {count > 1 && (
            <>
              <motion.button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Previous photo"
                className="-translate-y-1/2 absolute top-1/2 left-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur md:left-6"
                whileHover={navBtnHover}
                transition={hoverColorTransition}
              >
                <IconArrow className="h-5 w-5 rotate-225" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Next photo"
                className="-translate-y-1/2 absolute top-1/2 right-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-line bg-ink/30 text-fg/80 backdrop-blur md:right-6"
                whileHover={navBtnHover}
                transition={hoverColorTransition}
              >
                <IconArrow className="h-5 w-5 rotate-45" />
              </motion.button>
              <div className="-translate-x-1/2 absolute bottom-4 left-1/2">
                <span className="tag-mono rounded-full border border-line bg-ink/30 px-3 py-1 text-fg/70 tabular-nums backdrop-blur">
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(count).padStart(2, "0")}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
