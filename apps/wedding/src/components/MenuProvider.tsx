"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { MenuOverlay } from "./MenuOverlay";

interface MenuState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const MenuContext = createContext<MenuState | null>(null);

/** One menu per page: the logo row's toggle and the floating pill both drive it. */
export const MenuProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  const value = useMemo(() => ({ open, toggle, close }), [open, toggle, close]);
  return (
    <MenuContext.Provider value={value}>
      {children}
      <MenuOverlay open={open} onClose={close} />
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside MenuProvider");
  return ctx;
};
