"use client";

import { useTranslations } from "next-intl";
import { useMenu } from "./MenuProvider";
import { MenuToggle } from "./MenuToggle";

/** The logo row's menu button; shares state with the floating pill. */
export const MenuToggleInline = () => {
  const t = useTranslations("nav");
  const { open, toggle } = useMenu();
  return (
    <MenuToggle
      variant="ghost"
      open={open}
      onToggle={toggle}
      openLabel={t("menu")}
      closeLabel={t("close")}
    />
  );
};
