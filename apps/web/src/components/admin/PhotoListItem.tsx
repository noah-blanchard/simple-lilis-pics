"use client";

import type { Orientation } from "@/types/db";

const ORIENTATIONS: Orientation[] = ["landscape", "portrait"];

interface PhotoListItemProps {
  src: string;
  orientation: Orientation;
  isCover: boolean;
  onSetOrientation: (o: Orientation) => void;
  onSetCover: () => void;
  /** Create mode only — omit to hide the remove button. */
  onRemove?: () => void;
  onOpenFullscreen: () => void;
  /** Starts a Reorder.Item drag from this element (see ProjectForm's DraggablePhotoItem). */
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
}

/** Presentational photo card used by both the create and edit photo lists.
 *  No motion/react imports — the parent owns drag/reorder mechanics and
 *  passes down a plain pointer-down handler for the drag handle. */
export function PhotoListItem({
  src,
  orientation,
  isCover,
  onSetOrientation,
  onSetCover,
  onRemove,
  onOpenFullscreen,
  onDragHandlePointerDown,
}: PhotoListItemProps) {
  return (
    <div className="flex gap-3 rounded-2xl border border-line bg-panel2 p-2.5">
      <button
        type="button"
        onPointerDown={onDragHandlePointerDown}
        aria-label="Drag to reorder"
        className="flex shrink-0 cursor-grab touch-none select-none items-center justify-center self-stretch rounded-lg px-1 text-[15px] text-fg/30 transition-colors hover:text-fg/60 active:cursor-grabbing"
      >
        ⠿
      </button>

      <button
        type="button"
        onClick={onOpenFullscreen}
        aria-label="View photo fullscreen"
        className={`relative shrink-0 cursor-zoom-in overflow-hidden rounded-lg bg-ink ${
          orientation === "portrait" ? "h-24 w-13.5" : "h-24 w-40"
        }`}
      >
        {/* biome-ignore lint/performance/noImgElement: local blob preview or stored remote thumb */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex w-fit overflow-hidden rounded-lg border border-line text-[11px]">
          {ORIENTATIONS.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => onSetOrientation(o)}
              className={`px-2 py-1 capitalize transition-colors ${
                orientation === o
                  ? "bg-inverse text-on-inverse"
                  : "text-fg/60 hover:text-fg"
              }`}
            >
              {o === "landscape" ? "▭" : "▯"} {o}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSetCover}
            className={`rounded-lg border px-2 py-1 text-[11px] transition-colors ${
              isCover
                ? "border-accent bg-accent text-on-accent"
                : "border-line text-fg/60 hover:border-fg/40"
            }`}
          >
            {isCover ? "★ Cover" : "☆ Cover"}
          </button>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="ml-auto rounded-lg border border-line px-2 py-1 text-[11px] text-fg/60 transition-colors hover:border-danger hover:text-danger"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
