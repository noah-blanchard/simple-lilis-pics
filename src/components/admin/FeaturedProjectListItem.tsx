"use client";

interface FeaturedProjectListItemProps {
  src: string;
  title: string;
  year: string;
  /** Starts a Reorder.Item drag from this element (see the featured page's DraggableItem). */
  onDragHandlePointerDown: (e: React.PointerEvent) => void;
}

/** Presentational row for the /admin/featured reorder list. No motion/react
 *  imports — the parent owns drag/reorder mechanics (mirrors PhotoListItem). */
export function FeaturedProjectListItem({
  src,
  title,
  year,
  onDragHandlePointerDown,
}: FeaturedProjectListItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel2 p-2.5">
      <button
        type="button"
        onPointerDown={onDragHandlePointerDown}
        aria-label="Drag to reorder"
        className="flex shrink-0 cursor-grab touch-none select-none items-center justify-center self-stretch rounded-lg px-1 text-[15px] text-fg/30 transition-colors hover:text-fg/60 active:cursor-grabbing"
      >
        ⠿
      </button>

      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-ink">
        {/* biome-ignore lint/performance/noImgElement: stored remote thumb */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-[14px] text-fg">{title}</p>
        <p className="text-[12px] text-fg/50">{year}</p>
      </div>
    </div>
  );
}
