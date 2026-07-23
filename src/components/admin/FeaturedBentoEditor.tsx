"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import {
  aspectFor,
  type BentoTile,
  clampColSpan,
  packingEfficiency,
  packSkyline,
  presetLabel,
  presetsForOrientation,
  useBentoMetrics,
} from "@/lib/bento";
import {
  type Orientation,
  type ProjectWithRelations,
  resolveImageUrl,
} from "@/types/db";

/** The editor canvas always renders the canonical desktop grid (8 base columns)
 *  so every size preset is reachable and the saved `col_span` is the desktop
 *  value. The live site clamps spans down on smaller breakpoints. */
const COLS = 8;

/** Default size for a freshly-featured project: "S" (2 base columns). */
const DEFAULT_COL_SPAN = 2;

/** Gap between tiles in the editor canvas, in px. */
const GAP = 10;

/** Pointer travel (px) before a press becomes a drag rather than a click. */
const DRAG_THRESHOLD = 4;

// Weighted size pools for Shuffle — mostly S/M with the occasional larger or XS
// tile, so results vary run to run but stay tasteful.
const LANDSCAPE_POOL = [2, 2, 2, 4, 4, 6, 1, 8];
const PORTRAIT_POOL = [2, 2, 4, 1];

/** Minimum packing efficiency a Shuffle result must reach before it's accepted. */
const MIN_SHUFFLE_EFFICIENCY = 0.65;

interface EditorTile extends BentoTile {
  title: string;
  year: string;
  src: string;
}

function toTile(project: ProjectWithRelations): EditorTile {
  const cover =
    project.project_photos.find((p) => p.id === project.cover_photo_id) ??
    project.project_photos[0];
  const orientation: Orientation = cover?.orientation ?? "landscape";
  return {
    id: project.id,
    title: project.title_en || project.title_fr || "Untitled",
    year: project.project_date?.slice(0, 4) ?? "",
    src: cover ? resolveImageUrl(cover.image_path) : "",
    orientation,
    colSpan: clampColSpan(
      orientation,
      project.featured_col_span ?? DEFAULT_COL_SPAN,
      COLS,
    ),
  };
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Relative tile height (in column-width units) — used to order tallest-first
 *  so the skyline packer fills columns tightly. */
function heightUnits(tile: EditorTile): number {
  return tile.colSpan / aspectFor(tile.orientation);
}

/** Deterministic, tightly-packed arrangement (the stable default): landscapes
 *  get a periodic medium for rhythm, portraits stay slim, then everything is
 *  ordered tallest-first so the packer leaves minimal gaps. Same result each run. */
function autoArrange(tiles: EditorTile[]): EditorTile[] {
  const items = tiles.map((t) => ({ ...t }));
  let landscapeIndex = 0;
  for (const t of items) {
    if (t.orientation === "portrait") {
      t.colSpan = 2; // slim column
    } else {
      t.colSpan = landscapeIndex % 3 === 0 ? 4 : 2; // periodic medium, else small
      landscapeIndex++;
    }
  }
  return items.sort((a, b) => heightUnits(b) - heightUnits(a));
}

/** One random candidate: random weighted sizes + a shuffled order. */
function randomLayout(tiles: EditorTile[]): EditorTile[] {
  const items = tiles.map((t) => ({ ...t }));
  for (const t of items) {
    const pool = t.orientation === "portrait" ? PORTRAIT_POOL : LANDSCAPE_POOL;
    t.colSpan = pool[Math.floor(Math.random() * pool.length)];
  }
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Random, varied layout that still packs reasonably: try several candidates and
 *  take the first clearing the efficiency bar, else the tightest one tried. */
function shuffleLayout(tiles: EditorTile[]): EditorTile[] {
  let best = tiles;
  let bestEfficiency = -1;
  for (let attempt = 0; attempt < 40; attempt++) {
    const candidate = randomLayout(tiles);
    const efficiency = packingEfficiency(candidate, COLS);
    if (efficiency >= MIN_SHUFFLE_EFFICIENCY) return candidate;
    if (efficiency > bestEfficiency) {
      bestEfficiency = efficiency;
      best = candidate;
    }
  }
  return best;
}

interface DragState {
  id: string;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
}

export function FeaturedBentoEditor() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  const [tiles, setTiles] = useState<EditorTile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);

  // Seed the local (editable) tiles once, the first time data arrives.
  const initialized = useRef(false);
  if (!initialized.current && projects) {
    initialized.current = true;
    setTiles(
      projects
        .filter((p) => p.featured)
        .sort(
          (a, b) =>
            (a.featured_order ?? Infinity) - (b.featured_order ?? Infinity),
        )
        .map(toTile),
    );
  }

  const { setRef, elRef, metrics } = useBentoMetrics(COLS);
  const layout = metrics ? packSkyline(tiles, COLS, metrics.width, GAP) : null;

  const save = useMutation({
    mutationFn: () =>
      apiFetch("/api/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: tiles.map((t) => ({ id: t.id, col_span: t.colSpan })),
        }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const setColSpan = (id: string, colSpan: number) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, colSpan } : t)));
    save.reset();
  };

  const runAutoArrange = () => {
    setTiles((prev) => autoArrange(prev));
    save.reset();
  };

  const runShuffle = () => {
    setTiles((prev) => shuffleLayout(prev));
    save.reset();
  };

  // Reorder the list from the live pointer position (kept in a ref so the window
  // listeners, bound once per drag, always call the freshest closure).
  const reorderRef = useRef<(id: string, e: PointerEvent) => void>(() => {});
  reorderRef.current = (id, e) => {
    const grid = elRef.current;
    if (!grid || !layout) return;
    const rect = grid.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const occupant = layout.rects.find(
      (r) =>
        px >= r.left &&
        px < r.left + r.width &&
        py >= r.top &&
        py < r.top + r.height,
    );

    const from = tiles.findIndex((t) => t.id === id);
    if (from === -1) return;
    const to = occupant
      ? tiles.findIndex((t) => t.id === occupant.id)
      : tiles.length - 1; // empty area past the last tile → drop at the end
    if (occupant?.id === id || to === -1 || to === from) return;

    setTiles((prev) => arrayMove(prev, from, to));
    save.reset();
  };

  const dragId = drag?.id ?? null;
  useEffect(() => {
    if (!dragId) return;
    const onMove = (e: PointerEvent) => {
      setDrag((prev) =>
        prev
          ? {
              ...prev,
              x: e.clientX,
              y: e.clientY,
              active:
                prev.active ||
                Math.hypot(e.clientX - prev.startX, e.clientY - prev.startY) >
                  DRAG_THRESHOLD,
            }
          : prev,
      );
      reorderRef.current(dragId, e);
    };
    const onUp = () => setDrag(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [dragId]);

  const startDrag = (id: string, e: React.PointerEvent<HTMLElement>) => {
    setSelectedId(id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({
      id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      startX: e.clientX,
      startY: e.clientY,
      x: e.clientX,
      y: e.clientY,
      w: rect.width,
      h: rect.height,
      active: false,
    });
  };

  const byId = new Map(tiles.map((t) => [t.id, t]));
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const draggingTile = drag?.active ? byId.get(drag.id) : undefined;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[26px] tracking-tight">
            Featured layout
          </h1>
          <p className="mt-1 text-[14px] text-fg/55">
            Drag tiles to rearrange, click one to resize. Every tile keeps its
            exact aspect ratio — landscape 16:9, portrait 9:16 — at any size.
          </p>
        </div>
        {tiles.length > 0 && (
          <div className="flex items-center gap-2">
            <PillButton variant="ghost" size="sm" onClick={runShuffle}>
              Shuffle
            </PillButton>
            <PillButton variant="ghost" size="sm" onClick={runAutoArrange}>
              Auto arrange
            </PillButton>
            <PillButton
              variant="light"
              size="sm"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? "Saving…" : "Save layout"}
            </PillButton>
          </div>
        )}
      </div>

      {save.isError && (
        <p className="mb-4 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-[14px] text-danger">
          {(save.error as Error).message}
        </p>
      )}
      {save.isSuccess && !save.isPending && (
        <p className="mb-4 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-[14px] text-accent">
          Layout saved.
        </p>
      )}

      {isLoading && <p className="text-fg/55">Loading…</p>}
      {!isLoading && tiles.length === 0 && (
        <p className="text-fg/55">No featured projects yet.</p>
      )}

      {tiles.length > 0 && (
        <>
          {/* Size toolbar for the selected tile */}
          <div className="mb-4 flex min-h-9 flex-wrap items-center gap-2 rounded-xl border border-line bg-panel2 px-3 py-2">
            {selected ? (
              <>
                <span className="max-w-[220px] truncate text-[13px] text-fg/70">
                  <span className="text-fg">{selected.title}</span> ·{" "}
                  {selected.orientation}
                </span>
                <span className="mx-1 h-4 w-px bg-line" />
                <span className="text-[12px] text-fg/45">Size</span>
                {presetsForOrientation(selected.orientation).map((preset) => {
                  const active = preset.span === selected.colSpan;
                  return (
                    <button
                      key={preset.span}
                      type="button"
                      onClick={() => setColSpan(selected.id, preset.span)}
                      className={`h-7 min-w-8 rounded-lg border px-2 font-medium text-[12px] ${
                        active
                          ? "border-accent bg-accent text-on-accent"
                          : "border-line text-fg/70 hover:border-fg/40"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </>
            ) : (
              <span className="text-[13px] text-fg/50">
                Click a tile to resize it · drag to rearrange
              </span>
            )}
          </div>

          <div
            ref={setRef}
            className="relative w-full max-w-[1000px]"
            style={{
              height: layout ? layout.height : undefined,
              minHeight: 200,
            }}
          >
            {layout?.rects.map((r) => {
              const tile = byId.get(r.id);
              if (!tile) return null;
              return (
                <TileCard
                  key={tile.id}
                  tile={tile}
                  left={r.left}
                  top={r.top}
                  width={r.width}
                  height={r.height}
                  selected={selectedId === tile.id}
                  lifted={drag?.active === true && drag.id === tile.id}
                  onPointerDown={(e) => startDrag(tile.id, e)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* Floating drag image — follows the pointer, decoupled from the layout so
          the packed tiles animate underneath without any transform conflict. */}
      {drag?.active && draggingTile && (
        <div
          className="pointer-events-none fixed z-[100] overflow-hidden rounded-xl border-2 border-accent shadow-2xl"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: drag.w,
            height: drag.h,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: stored remote thumb */}
          <img
            src={draggingTile.src}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

interface TileCardProps {
  tile: EditorTile;
  left: number;
  top: number;
  width: number;
  height: number;
  selected: boolean;
  lifted: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
}

/** One absolutely-positioned bento tile. `layout` FLIP-animates it to its packed
 *  spot as the order/sizes change. It is never itself dragged (the floating
 *  overlay handles that), so there is no drag/layout conflict. */
function TileCard({
  tile,
  left,
  top,
  width,
  height,
  selected,
  lifted,
  onPointerDown,
}: TileCardProps) {
  return (
    <motion.div
      layout
      onPointerDown={onPointerDown}
      transition={{ type: "spring", stiffness: 620, damping: 46 }}
      style={{ left, top, width, height, position: "absolute" }}
      className={`group cursor-grab touch-none select-none overflow-hidden rounded-xl border-2 bg-panel2 active:cursor-grabbing ${
        lifted
          ? "border-accent border-dashed opacity-40"
          : selected
            ? "border-accent shadow-xl"
            : "border-transparent hover:border-fg/25"
      }`}
    >
      {/* biome-ignore lint/performance/noImgElement: stored remote thumb */}
      <img
        src={tile.src}
        alt=""
        draggable={false}
        className="pointer-events-none h-full w-full object-cover"
      />

      {/* Size badge (top-left) — the only chrome, for the editor's benefit */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 rounded-md bg-inverse/70 px-1.5 py-0.5 font-medium text-[10px] text-on-inverse/90 backdrop-blur-sm">
        {presetLabel(tile.orientation, tile.colSpan)}
      </span>
    </motion.div>
  );
}
