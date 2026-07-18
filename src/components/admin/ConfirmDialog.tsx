"use client";

import { AnimatePresence, motion } from "motion/react";
import { PillButton } from "@/components/PillButton";

import { EASE } from "@/lib/motion";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** Site-styled confirmation dialog (replaces window.confirm). Sits above the
 *  main modals (z-60) so it can confirm actions triggered from within them. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[var(--z-overlay-top)] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label={cancelLabel}
            onClick={onClose}
            className="absolute inset-0 bg-scrim backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-card border border-fg/10 bg-panel p-7 shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <h2 className="font-semibold text-[19px] tracking-tight">
              {title}
            </h2>
            {message && (
              <p className="mt-2 text-[14px] text-fg/55">{message}</p>
            )}
            <div className="mt-7 flex items-center justify-end gap-3">
              <PillButton variant="ghost" onClick={onClose}>
                {cancelLabel}
              </PillButton>
              <PillButton
                variant="danger"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Deleting…" : confirmLabel}
              </PillButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
