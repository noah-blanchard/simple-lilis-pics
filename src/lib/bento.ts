import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
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

// Base column counts for the span-based featured bento (home page + admin
// editor). The grid runs at DOUBLE resolution (8 / 4 / 2) so tiles can be sized
// in half-column steps — the smallest "XS" tile is 1 base column (half of the
// old smallest). A default "S" tile is 2 base columns, so the desktop grid still
// reads as ~4 columns wide.
export const FEATURED_BENTO_BREAKPOINTS: readonly ColumnBreakpoint[] = [
  { query: "(min-width: 1024px)", cols: 8 },
  { query: "(min-width: 640px)", cols: 4 },
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

/* ── Span-based bento (home featured grid + admin editor) ──
 *
 * The grid runs at double resolution: `colSpan` is measured in BASE columns
 * (8 across on desktop). The row unit is HALF a base column, and aspect is
 * locked to the cover photo's orientation, so `colSpan` is the only free
 * variable and `rowSpan` is derived — which keeps every tile's aspect exact:
 *   • landscape (2:1)  → rowSpan = colSpan
 *   • portrait  (1:2)  → rowSpan = 4 · colSpan
 */

export interface SizePreset {
  span: number; // base columns
  label: string;
}

/** Size presets per orientation, ordered small → large, in base columns.
 *  Landscape: XS/S/M/L/Hero. Portrait: XS/S/M (taller ones would tower). */
export const LANDSCAPE_PRESETS: readonly SizePreset[] = [
  { span: 1, label: "XS" },
  { span: 2, label: "S" },
  { span: 4, label: "M" },
  { span: 6, label: "L" },
  { span: 8, label: "Hero" },
] as const;
export const PORTRAIT_PRESETS: readonly SizePreset[] = [
  { span: 1, label: "XS" },
  { span: 2, label: "S" },
  { span: 4, label: "M" },
] as const;

export function presetsForOrientation(
  orientation: Orientation,
): readonly SizePreset[] {
  return orientation === "portrait" ? PORTRAIT_PRESETS : LANDSCAPE_PRESETS;
}

/** Label of the preset matching a given span (falls back to the raw span). */
export function presetLabel(orientation: Orientation, colSpan: number): string {
  return (
    presetsForOrientation(orientation).find((p) => p.span === colSpan)?.label ??
    `${colSpan}`
  );
}

/** Largest column span allowed for an orientation, before clamping to the
 *  available column count. */
function maxColSpanFor(orientation: Orientation): number {
  const presets = presetsForOrientation(orientation);
  return presets[presets.length - 1].span;
}

/** Row span derived from orientation + (clamped) column span. Preserves the
 *  2:1 / 1:2 aspect against a row unit of half a base column. */
export function rowSpanFor(orientation: Orientation, colSpan: number): number {
  return orientation === "portrait" ? colSpan * 4 : colSpan;
}

/** Clamp a requested column span to the orientation's max and the grid width. */
export function clampColSpan(
  orientation: Orientation,
  colSpan: number,
  columns: number,
): number {
  const max = Math.min(columns, maxColSpanFor(orientation));
  return Math.max(1, Math.min(colSpan, max));
}

export interface BentoTile {
  id: string;
  orientation: Orientation;
  colSpan: number; // requested (desktop preset); clamped during packing
}

export interface PlacedTile {
  id: string;
  colStart: number; // 0-based
  rowStart: number; // 0-based
  colSpan: number; // clamped to the active column count
  rowSpan: number;
}

export interface BentoLayout {
  placed: PlacedTile[]; // same order as the input tiles
  columns: number;
  totalRows: number;
}

/** Deterministic first-fit packer: for each tile in order, drop it into the
 *  first free colSpan×rowSpan block scanning top→bottom, left→right. The exact
 *  same function drives the editor preview and the live grid, so they match. */
export function packBento(tiles: BentoTile[], columns: number): BentoLayout {
  const cols = Math.max(1, columns);
  const occupied: boolean[][] = [];
  const ensureRow = (r: number) => {
    while (occupied.length <= r) occupied.push(new Array(cols).fill(false));
  };
  const fits = (row: number, col: number, cs: number, rs: number): boolean => {
    if (col + cs > cols) return false;
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) if (occupied[r][c]) return false;
    }
    return true;
  };
  const mark = (row: number, col: number, cs: number, rs: number) => {
    for (let r = row; r < row + rs; r++) {
      ensureRow(r);
      for (let c = col; c < col + cs; c++) occupied[r][c] = true;
    }
  };

  const placed: PlacedTile[] = [];
  for (const tile of tiles) {
    const colSpan = clampColSpan(tile.orientation, tile.colSpan, cols);
    const rowSpan = rowSpanFor(tile.orientation, colSpan);
    let row = 0;
    let done = false;
    while (!done) {
      for (let col = 0; col + colSpan <= cols; col++) {
        if (fits(row, col, colSpan, rowSpan)) {
          mark(row, col, colSpan, rowSpan);
          placed.push({
            id: tile.id,
            colStart: col,
            rowStart: row,
            colSpan,
            rowSpan,
          });
          done = true;
          break;
        }
      }
      if (!done) row++;
    }
  }

  return { placed, columns: cols, totalRows: occupied.length };
}

export interface BentoMetrics {
  colWidth: number; // resolved pixel width of one column track
  rowUnit: number; // = colWidth / 2 (grid-auto-rows height)
  colGap: number;
  rowGap: number;
}

export interface BentoMetricsState {
  /** Attach to the grid element (callback ref, so it measures the moment the
   *  node mounts — robust to the grid rendering after async data arrives). */
  setRef: (el: HTMLDivElement | null) => void;
  /** The same node, for reads like getBoundingClientRect during a drag. */
  elRef: RefObject<HTMLDivElement | null>;
  metrics: BentoMetrics | null;
}

/** Measure a CSS-grid element's resolved column track + gaps so the caller can
 *  set `grid-auto-rows` to half a column width and map pointer coords to cells.
 *  Reads the computed `grid-template-columns` (already px), so it is agnostic to
 *  the responsive Tailwind gap classes. Re-measures on resize and column change. */
export function useBentoMetrics(columns: number): BentoMetricsState {
  const elRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [metrics, setMetrics] = useState<BentoMetrics | null>(null);

  const measure = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const firstTrack = Number.parseFloat(
      cs.gridTemplateColumns.split(" ").filter(Boolean)[0] ?? "",
    );
    if (!Number.isFinite(firstTrack) || firstTrack <= 0) return;
    const colGap = Number.parseFloat(cs.columnGap) || 0;
    const rowGap = Number.parseFloat(cs.rowGap) || 0;
    setMetrics((prev) =>
      prev &&
      prev.colWidth === firstTrack &&
      prev.colGap === colGap &&
      prev.rowGap === rowGap
        ? prev
        : { colWidth: firstTrack, rowUnit: firstTrack / 2, colGap, rowGap },
    );
  }, []);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      elRef.current = el;
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (el) {
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        observerRef.current = ro;
        measure();
      }
    },
    [measure],
  );

  // Re-measure when the column count changes: the track width changes without a
  // container resize, so the ResizeObserver alone wouldn't catch it. `columns`
  // is a deliberate trigger even though it isn't read in the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-measure trigger
  useLayoutEffect(() => {
    measure();
  }, [measure, columns]);

  return { setRef, elRef, metrics };
}
