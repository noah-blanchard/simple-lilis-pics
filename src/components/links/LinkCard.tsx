"use client";

import { motion, useReducedMotion } from "motion/react";
import type { Locale } from "@/i18n/routing";
import { getLinkIcon } from "@/lib/links/icons";
import type { ResolvedLink } from "@/types/db";

interface LinkCardProps {
  link: ResolvedLink;
  locale: Locale;
  mode?: "public" | "editor";
  opensNewTabLabel: string;
  onSelect?: () => void;
  selected?: boolean;
}

const recentSignals = new Map<string, number>();

function publicHref(url: string, locale: Locale) {
  if (!url.startsWith("/") || locale === "en") return url;
  if (url === "/") return "/fr";
  return `/fr${url}`;
}

function recordClick(id: string) {
  const now = Date.now();
  if (now - (recentSignals.get(id) ?? 0) < 1000) return;
  recentSignals.set(id, now);

  const endpoint = `/api/links/${id}/click`;
  if (navigator.sendBeacon?.(endpoint, new Blob([], { type: "text/plain" }))) {
    return;
  }
  void fetch(endpoint, { method: "POST", keepalive: true }).catch(() => {});
}

export function LinkCard({
  link,
  locale,
  mode = "public",
  opensNewTabLabel,
  onSelect,
  selected = false,
}: LinkCardProps) {
  const reduce = useReducedMotion();
  const Icon = getLinkIcon(link.iconKey);
  const content = (
    <>
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 text-left">
        <span className="block break-words font-medium text-[16px] leading-snug">
          {link.name}
        </span>
        {link.subtitle && (
          <span className="mt-1 block break-words text-[13px] text-fg/55 leading-relaxed">
            {link.subtitle}
          </span>
        )}
      </span>
      <motion.span
        aria-hidden
        variants={{
          rest: { x: 0, opacity: 0.45 },
          hover: { x: reduce ? 0 : 2, opacity: 0.9 },
        }}
        transition={{ duration: 0.14 }}
        className="shrink-0 text-[18px]"
      >
        ↗
      </motion.span>
    </>
  );
  const className = `flex min-h-[72px] w-full items-center gap-3 rounded-[22px] border p-4 text-fg shadow-[0_10px_30px_rgb(23_23_23/0.06)] backdrop-blur-sm ${
    selected
      ? "border-accent bg-white/90"
      : "border-white/70 bg-white/70 hover:bg-white/90"
  }`;

  if (mode === "editor") {
    return (
      <motion.button
        type="button"
        onClick={onSelect}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        className={className}
      >
        {content}
      </motion.button>
    );
  }

  const newTab = link.openBehavior === "new_tab";
  return (
    <motion.a
      href={publicHref(link.url, locale)}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      aria-label={newTab ? `${link.name} (${opensNewTabLabel})` : undefined}
      onClick={() => recordClick(link.id)}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      className={className}
    >
      {content}
    </motion.a>
  );
}
