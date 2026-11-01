"use client";

import type { ReactNode } from "react";
import { useIsDesktop } from "@/lib/use-media-query";
import { Modal } from "./Modal";
import { Sheet } from "./Sheet";

interface AdminDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Secondary panel. Widens the dialog on desktop; stacks as a second sheet
   *  on mobile, where there is no room to sit side by side. */
  aside?: ReactNode;
  asideOpen?: boolean;
  asideTitle?: string;
  /** Dismiss the aside. Only needed on mobile, where it is its own sheet. */
  onAsideClose?: () => void;
  baseWidthRem?: number;
  asideWidthRem?: number;
}

/** Picks the right container for the viewport: a centred Modal on desktop, a
 *  full-height Sheet on mobile. Only one is ever mounted, so form state inside
 *  `children` is never duplicated across the two. */
export function AdminDialog({
  open,
  onClose,
  title,
  children,
  aside,
  asideOpen = false,
  asideTitle,
  onAsideClose,
  baseWidthRem,
  asideWidthRem,
}: AdminDialogProps) {
  const isDesktop = useIsDesktop();

  // Before the first measurement we cannot know which to render. Dialogs open
  // on interaction, so there is nothing to show during SSR anyway.
  if (isDesktop === null) return null;

  if (isDesktop) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title={title}
        aside={aside}
        asideOpen={asideOpen}
        asideTitle={asideTitle}
        baseWidthRem={baseWidthRem}
        asideWidthRem={asideWidthRem}
      >
        {children}
      </Modal>
    );
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title={title}>
        {children}
      </Sheet>

      {aside && (
        <Sheet
          layered
          open={open && asideOpen}
          onClose={() => onAsideClose?.()}
          title={asideTitle ?? ""}
        >
          {aside}
        </Sheet>
      )}
    </>
  );
}
