import { useEffect, useState } from "react";
import type { Orientation } from "@/types/db";

// Portrait covers are ~1.78× taller than landscape for the same column width;
// used to estimate column heights for the packing algorithm.
const PORTRAIT_RATIO = 16 / 9; // height = width × ratio
const LANDSCAPE_RATIO = 9 / 16;

/** Distribute items across N columns using a shortest-column-first algorithm.
 *  Preserves reading order within each column and avoids CSS `columns` (which
 *  breaks tab order and motion stagger). */
export function packColumns<
  T extends { cover: { orientation: Orientation } | null },
>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  const heights: number[] = new Array(cols).fill(0);

  for (const item of items) {
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push(item);
    const ratio =
      item.cover?.orientation === "portrait" ? PORTRAIT_RATIO : LANDSCAPE_RATIO;
    heights[shortest] += ratio;
  }

  return columns;
}

interface ColumnBreakpoint {
  query: string;
  cols: number;
}

// Ordered widest-first. The 4th/5th tiers keep portrait covers from growing
// too tall as the container widens on 2K/4K — extra columns hold each tile at
// a viewable width instead of ballooning its height.
export const BENTO_BREAKPOINTS: readonly ColumnBreakpoint[] = [
  { query: "(min-width: 2200px)", cols: 5 },
  { query: "(min-width: 1600px)", cols: 4 },
  { query: "(min-width: 1024px)", cols: 3 },
  { query: "(min-width: 640px)", cols: 2 },
] as const;

// Capped at 3 columns (vs. the portfolio grid's 5) so home-page featured
// tiles read bigger and more spacious.
export const FEATURED_BREAKPOINTS: readonly ColumnBreakpoint[] = [
  { query: "(min-width: 1280px)", cols: 3 },
  { query: "(min-width: 640px)", cols: 2 },
] as const;

/** Responsive column count driven by a breakpoint tier list (widest-first).
 *  Defaults to the portfolio bento grid's 5-tier (1 / 2 / 3 / 4 / 5) set. */
export function useColumnCount(
  breakpoints: readonly ColumnBreakpoint[] = BENTO_BREAKPOINTS,
): number {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const mqls = breakpoints.map((b) => window.matchMedia(b.query));
    const update = () => {
      const i = mqls.findIndex((mql) => mql.matches);
      setCols(i === -1 ? 1 : breakpoints[i].cols);
    };
    update();
    for (const mql of mqls) mql.addEventListener("change", update);
    return () => {
      for (const mql of mqls) mql.removeEventListener("change", update);
    };
  }, [breakpoints]);

  return cols;
}
