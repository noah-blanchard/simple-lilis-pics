"use client";

import { MenuIcon } from "./MenuIcon";
import { PillButton } from "./PillButton";

interface MenuToggleProps {
  open: boolean;
  onToggle: () => void;
  openLabel: string;
  closeLabel: string;
}

// The MENU/CLOSE pill. Reuses PillButton so the hover slot-roll and styling stay
// consistent; the icon morphs hamburger↔X and the label swaps with `open`.
export const MenuToggle = ({
  open,
  onToggle,
  openLabel,
  closeLabel,
}: MenuToggleProps) => (
  <PillButton
    variant="ghost"
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
