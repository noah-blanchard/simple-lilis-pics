"use client";

import { PillButton } from "@lili/ui/components/PillButton";
import type { PillVariant } from "@lili/ui/types";
import { MenuIcon } from "./MenuIcon";

interface MenuToggleProps {
  open: boolean;
  onToggle: () => void;
  openLabel: string;
  closeLabel: string;
  variant?: PillVariant;
}

// Adapted from apps/web: the Menu/Close pill. Reuses PillButton so the hover
// roll stays consistent; the icon morphs hamburger ↔ cross with `open`.
export const MenuToggle = ({
  open,
  onToggle,
  openLabel,
  closeLabel,
  variant = "ghost",
}: MenuToggleProps) => (
  <PillButton
    variant={variant}
    size="sm"
    onClick={onToggle}
    ariaExpanded={open}
    ariaControls="site-menu"
  >
    <span className="flex items-center gap-2">
      <MenuIcon open={open} className="h-4 w-4" />
      <span>{open ? closeLabel : openLabel}</span>
    </span>
  </PillButton>
);
