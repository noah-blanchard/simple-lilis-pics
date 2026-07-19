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

/** Responsive column count for the portfolio bento grid (1 / 2 / 3). */
export function useColumnCount(): number {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const update = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setCols(3);
      else if (window.matchMedia("(min-width: 640px)").matches) setCols(2);
      else setCols(1);
    };
    update();
    const mq = window.matchMedia("(min-width: 640px)");
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return cols;
}
