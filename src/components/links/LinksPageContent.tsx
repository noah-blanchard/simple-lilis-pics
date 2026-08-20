"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { ResolvedLink } from "@/types/db";
import { LinkCard } from "./LinkCard";

interface LinksPageContentProps {
  links: ResolvedLink[];
  locale: Locale;
  description: string;
  emptyLabel: string;
  linksLabel: string;
  opensNewTabLabel: string;
  localeControl?: ReactNode;
  mode?: "public" | "editor";
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  listContent?: ReactNode;
}

export function LinksPageContent({
  links,
  locale,
  description,
  emptyLabel,
  linksLabel,
  opensNewTabLabel,
  localeControl,
  mode = "public",
  selectedId,
  onSelect,
  listContent,
}: LinksPageContentProps) {
  const Root = mode === "public" ? "main" : "div";
  const identity = (
    <Image
      src="/logo.webp"
      alt="Lili Photography"
      width={1536}
      height={1024}
      priority
      className="h-20 w-auto sm:h-24"
    />
  );

  return (
    <Root className="min-h-svh bg-ink px-6 pt-5 pb-28 text-fg sm:pt-7 md:px-12">
      <div className="mx-auto w-full max-w-[640px]">
        <header className="mb-6">
          <div className="flex items-start justify-between gap-4">
            {mode === "public" ? (
              <Link href="/" className="inline-flex rounded-xl">
                {identity}
              </Link>
            ) : (
              <div>{identity}</div>
            )}
            {localeControl}
          </div>
          <h1 className="display mt-2 text-3xl tracking-tight sm:text-4xl">
            Lilis Pics
          </h1>
          <p className="mt-2 max-w-[520px] text-[14px] text-fg/60 leading-relaxed sm:text-[15px]">
            {description}
          </p>
        </header>

        {listContent ??
          (links.length === 0 ? (
            <p className="rounded-card border border-line bg-panel px-5 py-6 text-[14px] text-fg/55">
              {emptyLabel}
            </p>
          ) : (
            <nav aria-label={linksLabel}>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.id}>
                    <LinkCard
                      link={link}
                      locale={locale}
                      mode={mode}
                      opensNewTabLabel={opensNewTabLabel}
                      selected={selectedId === link.id}
                      onSelect={() => onSelect?.(link.id)}
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
      </div>
    </Root>
  );
}
