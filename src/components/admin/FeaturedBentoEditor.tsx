"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { PillButton } from "@/components/PillButton";
import { apiFetch } from "@/lib/api/client";
import {
  type BentoTile,
  clampColSpan,
  packBento,
  presetLabel,
  presetsForOrientation,
  rowSpanFor,
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

/** Size + order the tiles from their landscape/portrait mix: landscapes get a
 *  periodic medium for rhythm, portraits stay slim, then everything is ordered
 *  tallest-first so the first-fit packer fills columns tightly. */
function autoArrange(tiles: EditorTile[]): EditorTile[] {
  const items = tiles.map((t) => ({ ...t }));
  let landscapeIndex = 0;
  for (const t of items) {
    if (t.orientation === "portrait") {
      t.colSpan = 2; // slim column (2 wide × 8 tall)
    } else {
      t.colSpan = landscapeIndex % 3 === 0 ? 4 : 2; // periodic M, else S
      landscapeIndex++;
    }
  }
  return items.sort(
    (a, b) =>
      rowSpanFor(b.orientation, b.colSpan) -
      rowSpanFor(a.orientation, a.colSpan),
  );
}

export function FeaturedBentoEditor() {
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ProjectWithRelations[]>("/api/projects"),
  });

  const [tiles, setTiles] = useState<EditorTile[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Seed the local (editable) tiles once, the first time data arrives — not on
  // every background refetch, so an in-progress edit is never reset.
  const initialized = useRef(false);
  if (!initialized.current && projects) {
    initialized.current = true;
    const seeded = projects
      .filter((p) => p.featured)
      .sort(
        (a, b) =>
          (a.featured_order ?? Infinity) - (b.featured_order ?? Infinity),
      )
      .map(toTile);
    setTiles(seeded);
  }

  const { setRef, elRef, metrics } = useBentoMetrics(COLS);
  const { placed } = packBento(tiles, COLS);

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

  // Map the live pointer position to a target index and reorder mid-drag; the
  // packer re-runs and non-dragged tiles animate to their new slots (layout).
  const handleDrag = (id: string, e: PointerEvent) => {
    const grid = elRef.current;
    if (!grid || !metrics) return;
    const rect = grid.getBoundingClientRect();
    const colStride = metrics.colWidth + metrics.colGap;
    const rowStride = metrics.rowUnit + metrics.rowGap;
    if (colStride <= 0 || rowStride <= 0) return;

    const col = Math.min(
      COLS - 1,
      Math.max(0, Math.floor((e.clientX - rect.left) / colStride)),
    );
    const row = Math.max(0, Math.floor((e.clientY - rect.top) / rowStride));

    const occupant = placed.find(
      (t) =>
        col >= t.colStart &&
        col < t.colStart + t.colSpan &&
        row >= t.rowStart &&
        row < t.rowStart + t.rowSpan,
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

  const byId = new Map(tiles.map((t) => [t.id, t]));
  const selected = selectedId ? byId.get(selectedId) : undefined;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-semibold text-[26px] tracking-tight">
            Featured layout
          </h1>
          <p className="mt-1 text-[14px] text-fg/55">
            Drag tiles to rearrange, click one to resize — the grid packs itself
            and always keeps each photo&apos;s aspect ratio. This is the desktop
            layout; it collapses on smaller screens.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PillButton
            variant="ghost"
            size="sm"
            disabled={tiles.length === 0}
            onClick={runAutoArrange}
          >
            Auto arrange
          </PillButton>
          <PillButton
            variant="light"
            size="sm"
            disabled={save.isPending || tiles.length === 0}
            onClick={() => save.mutate()}
          >
            {save.isPending ? "Saving…" : "Save layout"}
          </PillButton>
        </div>
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

          <div className="overflow-x-auto pb-2">
            <div
              ref={setRef}
              className="grid min-w-[560px] max-w-[1000px] gap-2 md:gap-3"
              style={{
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                gridAutoRows: metrics ? `${metrics.rowUnit}px` : undefined,
              }}
            >
              {placed.map((p) => {
                const tile = byId.get(p.id);
                if (!tile) return null;
                return (
                  <TileCard
                    key={tile.id}
                    tile={tile}
                    colStart={p.colStart}
                    colSpan={p.colSpan}
                    rowStart={p.rowStart}
                    rowSpan={p.rowSpan}
                    measured={metrics !== null}
                    dragging={draggingId === tile.id}
                    selected={selectedId === tile.id}
                    onSelect={() => setSelectedId(tile.id)}
                    onDragStart={() => {
                      setDraggingId(tile.id);
                      setSelectedId(tile.id);
                    }}
                    onDragMove={(e) => handleDrag(tile.id, e)}
                    onDragEnd={() => setDraggingId(null)}
                  />
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface TileCardProps {
  tile: EditorTile;
  colStart: number;
  colSpan: number;
  rowStart: number;
  rowSpan: number;
  measured: boolean;
  dragging: boolean;
  selected: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragMove: (e: PointerEvent) => void;
  onDragEnd: () => void;
}

/** One draggable, selectable bento tile. The whole tile is the drag surface;
 *  `layout` FLIP-animates it to its packed slot whenever the layout changes. */
function TileCard({
  tile,
  colStart,
  colSpan,
  rowStart,
  rowSpan,
  measured,
  dragging,
  selected,
  onSelect,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TileCardProps) {
  return (
    <motion.div
      layout
      drag
      dragSnapToOrigin
      dragElastic={0.12}
      dragMomentum={false}
      whileDrag={{ scale: 1.03 }}
      onDragStart={onDragStart}
      onDrag={(e) => onDragMove(e as PointerEvent)}
      onDragEnd={onDragEnd}
      onTap={onSelect}
      transition={{ type: "spring", stiffness: 620, damping: 46 }}
      style={{
        gridColumn: `${colStart + 1} / span ${colSpan}`,
        gridRow: `${rowStart + 1} / span ${rowSpan}`,
        zIndex: dragging ? 50 : selected ? 20 : 1,
        aspectRatio: measured ? undefined : `${2 * colSpan} / ${rowSpan}`,
      }}
      className={`group relative cursor-grab touch-none select-none overflow-hidden rounded-xl border-2 bg-panel2 active:cursor-grabbing ${
        selected
          ? "border-accent shadow-xl"
          : dragging
            ? "border-accent/70 shadow-2xl"
            : "border-transparent hover:border-fg/20"
      }`}
    >
      {/* biome-ignore lint/performance/noImgElement: stored remote thumb */}
      <img
        src={tile.src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-scrim/85 via-transparent to-transparent" />

      {/* Current size badge (top-left) */}
      <span className="pointer-events-none absolute top-1.5 left-1.5 rounded-md bg-inverse/70 px-1.5 py-0.5 font-medium text-[10px] text-on-inverse/90 backdrop-blur-sm">
        {presetLabel(tile.orientation, colSpan)}
      </span>

      {/* Title (bottom) */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2">
        <p className="truncate font-medium text-[12px] text-on-inverse leading-tight">
          {tile.title}
        </p>
        {tile.year && (
          <p className="text-[10px] text-on-inverse/70">{tile.year}</p>
        )}
      </div>
    </motion.div>
  );
}
