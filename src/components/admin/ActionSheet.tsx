"use client";

import { AnimatePresence, motion } from "motion/react";
import { EASE } from "@/lib/motion";

export interface SheetAction {
  label: string;
  onSelect: () => void;
  /** Renders in the danger colour and sits apart from the rest. */
  destructive?: boolean;
  disabled?: boolean;
  /** Shown under the label when an action is unavailable. */
  hint?: string;
}

/** Bottom-anchored list of full-width actions — the mobile stand-in for a row
 *  of small inline buttons that cannot meet touch-target sizes. */
export function ActionSheet({
  open,
  onClose,
  title,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  actions: SheetAction[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-overlay-top)] flex flex-col justify-end lg:hidden">
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
            className="relative rounded-t-card border-line border-t bg-panel px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong/40" />

            {title && (
              <p className="truncate px-2 pb-2 text-[13px] text-fg/45">
                {title}
              </p>
            )}

            <div className="flex flex-col">
              {actions.map(
                ({ label, onSelect, destructive, disabled, hint }) => (
                  <button
                    key={label}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelect();
                      onClose();
                    }}
                    className={`flex min-h-14 flex-col justify-center rounded-xl px-3 text-left text-[15px] transition-colors disabled:opacity-40 ${
                      destructive ? "text-danger" : "text-fg"
                    }`}
                  >
                    {label}
                    {hint && (
                      <span className="text-[12px] text-fg/45">{hint}</span>
                    )}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-2 min-h-14 w-full rounded-xl bg-panel2 text-[15px] text-fg/70"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
