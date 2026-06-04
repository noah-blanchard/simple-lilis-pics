"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Optional content for an expandable side panel (slides in from the right
   *  and widens the dialog). */
  aside?: ReactNode;
  asideOpen?: boolean;
  asideTitle?: string;
  /** Base dialog width (rem). The dialog grows by `asideWidthRem` when the
   *  side panel is open. */
  baseWidthRem?: number;
  asideWidthRem?: number;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  aside,
  asideOpen = false,
  asideTitle,
  baseWidthRem = 52,
  asideWidthRem = 26,
}: ModalProps) {
  const hasAside = Boolean(aside);
  const expanded = hasAside && asideOpen;
  const maxWidth = `${expanded ? baseWidthRem + asideWidthRem : baseWidthRem}rem`;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative z-10 flex h-[88vh] w-full flex-col overflow-hidden rounded-card border border-fg/10 bg-panel shadow-2xl"
            initial={{ opacity: 0, y: 24, scale: 0.97, maxWidth }}
            animate={{ opacity: 1, y: 0, scale: 1, maxWidth }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-center justify-between border-line border-b px-6 py-4">
              <h2 className="font-semibold text-[18px]">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="text-[22px] text-fg/50 leading-none transition-colors hover:text-fg"
              >
                ×
              </button>
            </div>

            <div className="flex min-h-0 flex-1">
              {/* main pane fills the height; its content manages its own scroll */}
              <div className="min-w-0 flex-1 overflow-hidden p-6">
                {children}
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.aside
                    className="shrink-0 overflow-hidden border-line border-l"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: `${asideWidthRem}rem`, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                  >
                    <div
                      className="flex h-full flex-col"
                      style={{ width: `${asideWidthRem}rem` }}
                    >
                      {asideTitle && (
                        <div className="shrink-0 border-line border-b px-5 py-4 font-semibold text-[15px]">
                          {asideTitle}
                        </div>
                      )}
                      {/* aside content manages its own scroll (see TagsManager) */}
                      <div className="min-h-0 flex-1 p-5">{aside}</div>
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
