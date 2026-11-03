import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { Logo } from "./Logo";
import { MenuToggleInline } from "./MenuToggleInline";

/** Logo row: logo left, locale switcher and menu toggle right. The floating
 *  pill appears once this row scrolls out of view. */
export const PageTop = async () => {
  const t = await getTranslations("nav");
  return (
    <header
      id="page-top"
      className="container-site flex items-center justify-between gap-6 pt-6 md:pt-8"
    >
      <Logo alt={t("logoAlt")} />
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <LocaleSwitcher />
        </div>
        <MenuToggleInline />
      </div>
    </header>
  );
};
