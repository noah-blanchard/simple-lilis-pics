"use client";

import { BentoCard } from "@/components/BentoCard";
import {
  FEATURED_BENTO_BREAKPOINTS,
  packBento,
  useBentoMetrics,
  useColumnCount,
} from "@/lib/bento";
import type { ResolvedProject } from "@/types/db";

interface FeaturedBentoGridProps {
  items: ResolvedProject[];
}

/** Home page featured section rendered as a real span-based bento grid. Uses
 *  the same `packBento` packer as the admin editor, so the live layout matches
 *  the editor exactly. Row height = half a column width (measured), which keeps
 *  every tile at its orientation's locked aspect (landscape 2:1, portrait 1:2). */
export const FeaturedBentoGrid = ({ items }: FeaturedBentoGridProps) => {
  const cols = useColumnCount(FEATURED_BENTO_BREAKPOINTS);
  const { setRef, metrics } = useBentoMetrics(cols);

  const { placed } = packBento(
    items.map((p) => ({
      id: p.id,
      orientation: p.cover?.orientation ?? "landscape",
      colSpan: p.featuredColSpan,
    })),
    cols,
  );
  const byId = new Map(items.map((p) => [p.id, p]));

  return (
    <div
      ref={setRef}
      className="grid gap-6 md:gap-8"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gridAutoRows: metrics ? `${metrics.rowUnit}px` : undefined,
      }}
    >
      {placed.map((tile, i) => {
        const project = byId.get(tile.id);
        if (!project) return null;
        return (
          <div
            key={tile.id}
            style={{
              gridColumn: `${tile.colStart + 1} / span ${tile.colSpan}`,
              gridRow: `${tile.rowStart + 1} / span ${tile.rowSpan}`,
              // Fallback height before the row unit is measured (e.g. the SSR
              // paint before hydration), so cells never collapse.
              aspectRatio: metrics
                ? undefined
                : `${2 * tile.colSpan} / ${tile.rowSpan}`,
            }}
          >
            <BentoCard project={project} index={i} priority={i < 3} fill />
          </div>
        );
      })}
    </div>
  );
};
