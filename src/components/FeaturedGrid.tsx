"use client";

import { BentoCard } from "@/components/BentoCard";
import { FEATURED_BREAKPOINTS, packColumns, useColumnCount } from "@/lib/bento";
import type { ResolvedProject } from "@/types/db";

interface FeaturedGridProps {
  items: ResolvedProject[];
}

// Orientation-aware masonry for the home page's featured section — same
// packing/column logic as PortfolioBento, capped at fewer columns
// (FEATURED_BREAKPOINTS) so tiles read bigger.
export const FeaturedGrid = ({ items }: FeaturedGridProps) => {
  const cols = useColumnCount(FEATURED_BREAKPOINTS);
  const columns = packColumns(items, cols);

  // Flat index per item for stagger delay (stable across re-renders).
  const flatIndex = new Map<string, number>();
  let i = 0;
  for (const col of columns) {
    for (const item of col) {
      flatIndex.set(item.id, i++);
    }
  }

  return (
    <div className="flex gap-6 md:gap-8">
      {columns.map((col) => (
        <div
          key={col[0]?.id ?? "empty"}
          className="flex min-w-0 flex-1 flex-col gap-6 md:gap-8"
        >
          {col.map((project) => (
            <BentoCard
              key={project.id}
              project={project}
              index={flatIndex.get(project.id) ?? 0}
              priority={(flatIndex.get(project.id) ?? 99) < 3}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
