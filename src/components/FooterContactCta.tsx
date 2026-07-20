"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { PillButton } from "./PillButton";

// Footer renders on the homepage, the portfolio archive, and project detail
// pages, but #contact only exists on the homepage — off-home this needs to
// be a real navigation back to `/#contact` rather than a dead in-page anchor.
export const FooterContactCta = () => {
  const t = useTranslations("footer");
  const pathname = usePathname();
  const href = pathname === "/" ? "#contact" : "/#contact";

  return (
    <PillButton href={href} variant="light">
      {t("getInTouch")}
    </PillButton>
  );
};
