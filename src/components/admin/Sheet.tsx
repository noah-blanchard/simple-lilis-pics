"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE } from "@/lib/motion";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Rendered in a bar pinned to the bottom, above the home indicator. */
  footer?: ReactNode;
  /** Stack this sheet above another one (e.g. tags over the project form). */
  layered?: boolean;
}

/** Full-height mobile counterpart to Modal. The body scrolls between a fixed
 *  header and an optional action bar, so the primary action stays reachable
 *  with the on-screen keyboard open. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
  layered = false,
}: SheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className={`fixed inset-0 flex flex-col justify-end ${
            layered ? "z-[var(--z-overlay-top)]" : "z-[var(--z-overlay)]"
          }`}
        >
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
            role="dialog"
            aria-modal="true"
            className="relative flex h-[94dvh] flex-col overflow-hidden rounded-t-card border-line border-t bg-panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div className="flex shrink-0 items-center justify-between border-line border-b px-4 py-3">
              <h2 className="font-semibold text-[17px]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 flex h-11 w-11 items-center justify-center text-[24px] text-fg/50 leading-none"
              >
                ×
              </button>
            </div>

            {/* The content owns its own scrolling, matching Modal's contract. */}
            <div className="min-h-0 flex-1 overflow-hidden p-4">{children}</div>

            {footer && (
              <div className="shrink-0 border-line border-t px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
