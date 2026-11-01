"use client";

import { useTranslations } from "next-intl";
import { navItems } from "@/data/nav";
import { Link, usePathname } from "@/i18n/navigation";
import {
  isInPageAnchor,
  resolveNavHref,
  smoothScrollToAnchor,
} from "@/lib/navTarget";

const linkClass =
  "block text-[15px] text-fg/80 uppercase tracking-wide hover:text-accent-strong";

// Footer renders on the homepage, the portfolio archive, and project detail
// pages, so its sitemap column needs the same homepage-anchor-vs-real-route
// resolution as the nav rail/overlay — a client leaf so Footer itself can
// stay a Server Component.
export const FooterSitemapLinks = () => {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {navItems.map((item) => {
        const label = t(`items.${item.key}`);

        if (isInPageAnchor(item, isHome)) {
          return (
            <a
              key={item.key}
              href={item.target}
              className={linkClass}
              onClick={(e) => {
                e.preventDefault();
                smoothScrollToAnchor(item.target);
              }}
            >
              {label}
            </a>
          );
        }

        return (
          <Link
            key={item.key}
            href={resolveNavHref(item, isHome)}
            className={linkClass}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
};
