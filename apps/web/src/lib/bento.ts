import {
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Orientation } from "@/types/db";

export interface ColumnBreakpoint {
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
 * (8 across on desktop). A tile's height is derived as width ÷ its exact aspect
 * (landscape 16:9, portrait 9:16), so the ratio is locked to orientation and can
 * never drift with size — `colSpan` is the only free variable.
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

/** Exact tile aspect (width ÷ height), locked to orientation. Landscape is
 *  ALWAYS 16:9, portrait is ALWAYS 9:16 — no other value is ever produced. */
export function aspectFor(orientation: Orientation): number {
  return orientation === "portrait" ? 9 / 16 : 16 / 9;
}

export interface PlacedRect {
  id: string;
  left: number; // px
  top: number; // px
  width: number; // px
  height: number; // px = width / aspect (so aspect is always exact)
}

export interface SkylineLayout {
  rects: PlacedRect[]; // same order as the input tiles
  height: number; // total px height of the packed area
}

/** Skyline (shelf) packer over `columns` equal columns of a `containerWidth`-px
 *  row. Each tile's height is derived as width ÷ exact aspect, so landscape tiles
 *  are always 16:9 and portrait tiles always 9:16 regardless of size — the height
 *  is never tied to a shared row unit, so it can't drift. Tiles drop into the
 *  lowest available slot across their column span, keeping the layout tight. */
export function packSkyline(
  tiles: BentoTile[],
  columns: number,
  containerWidth: number,
  gap: number,
): SkylineLayout {
  const cols = Math.max(1, columns);
  // colStride includes one gap, so `cols` columns span the full width exactly.
  const colStride = (containerWidth + gap) / cols;
  const heights = new Array(cols).fill(0);
  const rects: PlacedRect[] = [];

  for (const tile of tiles) {
    const span = clampColSpan(tile.orientation, tile.colSpan, cols);
    const width = Math.max(0, span * colStride - gap);
    const height = width / aspectFor(tile.orientation);

    // Find the column offset whose spanned columns have the lowest top edge.
    let bestCol = 0;
    let bestTop = Infinity;
    for (let start = 0; start + span <= cols; start++) {
      let top = 0;
      for (let k = start; k < start + span; k++)
        top = Math.max(top, heights[k]);
      if (top < bestTop) {
        bestTop = top;
        bestCol = start;
      }
    }

    const left = bestCol * colStride;
    rects.push({ id: tile.id, left, top: bestTop, width, height });
    const nextTop = bestTop + height + gap;
    for (let k = bestCol; k < bestCol + span; k++) heights[k] = nextTop;
  }

  const total = heights.length ? Math.max(...heights) : 0;
  return { rects, height: Math.max(0, total - gap) };
}

/** Fraction of the packed bounding box actually covered by tiles (0..1). Uses a
 *  unit-space, gap-free skyline, so it measures how tightly a layout packs
 *  regardless of pixel width — handy for scoring random "shuffle" candidates. */
export function packingEfficiency(tiles: BentoTile[], columns: number): number {
  const layout = packSkyline(tiles, columns, columns, 0);
  if (layout.height <= 0) return 0;
  let area = 0;
  for (const r of layout.rects) area += r.width * r.height;
  return area / (columns * layout.height);
}

export interface BentoMetrics {
  width: number; // container content width in px
}

export interface BentoMetricsState {
  /** Attach to the grid element (callback ref, so it measures the moment the
   *  node mounts — robust to the grid rendering after async data arrives). */
  setRef: (el: HTMLDivElement | null) => void;
  /** The same node, for reads like getBoundingClientRect during a drag. */
  elRef: RefObject<HTMLDivElement | null>;
  metrics: BentoMetrics | null;
}

/** Measure a container's content width so the caller can lay tiles out in px.
 *  Uses a callback ref + ResizeObserver, so it measures the instant the node
 *  mounts (robust to the grid rendering after async data arrives) and on resize. */
export function useBentoMetrics(columns: number): BentoMetricsState {
  const elRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const [metrics, setMetrics] = useState<BentoMetrics | null>(null);

  const measure = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (!Number.isFinite(width) || width <= 0) return;
    setMetrics((prev) => (prev && prev.width === width ? prev : { width }));
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

  // Re-measure when the column count changes (a media-query change can alter the
  // effective width without a container resize). `columns` is a deliberate
  // trigger even though it isn't read in the effect body.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional re-measure trigger
  useLayoutEffect(() => {
    measure();
  }, [measure, columns]);

  return { setRef, elRef, metrics };
}
