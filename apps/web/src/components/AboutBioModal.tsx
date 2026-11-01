"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { EASE } from "@/lib/motion";

interface AboutBioModalProps {
  open: boolean;
  onClose: () => void;
  photoSrc: string;
  photoAlt: string;
  paragraphs: string[];
  /** Iris origin, in viewport percentage, captured from the trigger click. */
  origin: { x: number; y: number };
}

// Shared-layout photo morph (the About section's image carries the same
// layoutId while this is closed — see AboutSection) + a click-anchored
// aperture-iris clip-path wipe, mirroring the circle-wipe technique already
// used by MenuOverlay but parameterized by the trigger's click point instead
// of a fixed corner.
export const AboutBioModal = ({
  open,
  onClose,
  photoSrc,
  photoAlt,
  paragraphs,
  origin,
}: AboutBioModalProps) => {
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const irisVariants = reduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { clipPath: `circle(0% at ${origin.x}% ${origin.y}%)` },
        visible: { clipPath: `circle(150% at ${origin.x}% ${origin.y}%)` },
      };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[var(--z-overlay)] overflow-y-auto"
          variants={irisVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: reduce ? 0.3 : 0.7, ease: EASE }}
        >
          {/* Shared-layout backdrop photo — morphs from the About section's
              small image (same layoutId) into this full-bleed one. */}
          <motion.div layoutId="about-photo" className="fixed inset-0">
            <Image
              src={photoSrc}
              alt={photoAlt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-ink/80" />
          </motion.div>

          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="fixed top-6 right-6 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-panel/80 text-[22px] text-fg leading-none backdrop-blur transition-colors hover:text-accent md:top-8 md:right-8"
          >
            ×
          </button>

          <div className="relative z-[1] flex min-h-full items-center justify-center px-6 py-24 md:px-12">
            <div className="max-w-[640px]">
              {paragraphs.map((p, i) => (
                <motion.p
                  key={p.slice(0, 24)}
                  initial={
                    reduce
                      ? { opacity: 0 }
                      : { opacity: 0, y: 12, filter: "blur(8px)" }
                  }
                  animate={
                    reduce
                      ? { opacity: 1 }
                      : { opacity: 1, y: 0, filter: "blur(0px)" }
                  }
                  transition={{
                    duration: 0.6,
                    delay: reduce ? 0 : 0.25 + i * 0.12,
                    ease: EASE,
                  }}
                  className={`text-fg ${
                    i === 0
                      ? "display mb-5 text-3xl italic md:text-4xl"
                      : "mb-4 text-[15px] text-fg/80 leading-relaxed md:text-[16px]"
                  }`}
                >
                  {p}
                </motion.p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
