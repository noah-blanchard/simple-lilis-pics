"use client";

import type { Locale } from "@lili/core/i18n/routing";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { crossfadeTransition } from "@/lib/motion";
import { TextLink } from "./TextLink";

export interface IndexItem {
  slug: string;
  type: string;
  /** Pre-rendered StoryPrint for this story (server-rendered by the page). */
  node: React.ReactNode;
}

interface StoriesIndexProps {
  items: IndexItem[];
  /** Type filters present in `items`, with their labels. */
  filters: { key: string; label: string }[];
  allLabel: string;
  locale?: Locale;
}

/** The index grid with an optional filter by wedding type. */
export const StoriesIndex = ({
  items,
  filters,
  allLabel,
}: StoriesIndexProps) => {
  const [active, setActive] = useState<string>("all");
  const visible =
    active === "all" ? items : items.filter((i) => i.type === active);

  return (
    <div>
      {filters.length > 1 ? (
        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-2">
          <TextLink pressed={active === "all"} onClick={() => setActive("all")}>
            {allLabel}
          </TextLink>
          {filters.map((f) => (
            <TextLink
              key={f.key}
              pressed={active === f.key}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </TextLink>
          ))}
        </div>
      ) : null}
      <AnimatePresence mode="wait" initial={false}>
        <motion.ul
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={crossfadeTransition}
          className="mt-14 grid list-none gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
        >
          {visible.map((item) => (
            <li key={item.slug}>{item.node}</li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
};
