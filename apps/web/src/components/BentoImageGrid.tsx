"use client";

import { BentoCard } from "@/components/BentoCard";
import {
  aspectFor,
  type ColumnBreakpoint,
  packSkyline,
  useBentoMetrics,
  useColumnCount,
} from "@/lib/bento";
import type { Orientation, ResolvedProject } from "@/types/db";

interface BentoImageGridProps {
  items: ResolvedProject[];
  /** Responsive column-count tiers. */
  breakpoints: readonly ColumnBreakpoint[];
  /** Gap between tiles, in px. */
  gap: number;
  /** Column span for a given project (drives width; height = width ÷ aspect). */
  colSpanFor: (project: ResolvedProject) => number;
}

const orientationOf = (p: ResolvedProject): Orientation =>
  p.cover?.orientation ?? "landscape";

/** Shared, image-only bento used by the home featured section and the portfolio
 *  archive. Each tile's height is width ÷ exact aspect (landscape 16:9, portrait
 *  9:16 — always), packed with a skyline packer and absolutely positioned so the
 *  aspect ratio can never drift with size or gaps. */
export const BentoImageGrid = ({
  items,
  breakpoints,
  gap,
  colSpanFor,
}: BentoImageGridProps) => {
  const cols = useColumnCount(breakpoints);
  const { setRef, metrics } = useBentoMetrics(cols);

  const tiles = items.map((p) => ({
    id: p.id,
    orientation: orientationOf(p),
    colSpan: colSpanFor(p),
  }));
  const layout = metrics ? packSkyline(tiles, cols, metrics.width, gap) : null;
  const byId = new Map(items.map((p) => [p.id, p]));

  return (
    <div
      ref={setRef}
      className="relative w-full"
      style={{ height: layout ? layout.height : undefined }}
    >
      {layout
        ? layout.rects.map((r, i) => {
            const project = byId.get(r.id);
            if (!project) return null;
            return (
              <div
                key={r.id}
                className="absolute"
                style={{
                  left: r.left,
                  top: r.top,
                  width: r.width,
                  height: r.height,
                }}
              >
                <BentoCard project={project} index={i} priority={i < 3} fill />
              </div>
            );
          })
        : // Pre-measure / SSR fallback: a simple stack of exact-aspect tiles so
          // the section is never empty before the client measures its width.
          items.map((project, i) => (
            <div
              key={project.id}
              className="mb-5"
              style={{ aspectRatio: aspectFor(orientationOf(project)) }}
            >
              <BentoCard project={project} index={i} priority={i < 3} fill />
            </div>
          ))}
    </div>
  );
};
