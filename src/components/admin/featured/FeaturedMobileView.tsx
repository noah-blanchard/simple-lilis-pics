"use client";

import Image from "next/image";
import type { EditorTile } from "@/components/admin/FeaturedBentoEditor";
import { PillButton } from "@/components/PillButton";
import { packSkyline, presetLabel, useBentoMetrics } from "@/lib/bento";

/** Gap between preview tiles, in px — tighter than the editor's, since the
 *  whole grid is scaled down to phone width. */
const GAP = 6;

/** Phone view of the featured layout. It renders the same skyline packing the
 *  desktop editor does, but read-only: free-dragging an 8-column canvas at
 *  390px means ~45px targets, which is not an honest editing surface. Shuffle
 *  still gives a way to change the arrangement from a phone. */
export function FeaturedMobileView({
  tiles,
  columns,
  onShuffle,
  onSave,
  saving,
}: {
  tiles: EditorTile[];
  columns: number;
  onShuffle: () => void;
  onSave: () => void;
  saving: boolean;
}) {
  const { setRef, metrics } = useBentoMetrics(columns);
  const layout = metrics
    ? packSkyline(tiles, columns, metrics.width, GAP)
    : null;

  return (
    <div className="lg:hidden">
      <div className="mb-4 flex items-center gap-2">
        <PillButton
          variant="ghost"
          size="sm"
          onClick={onShuffle}
          className="min-h-11 flex-1"
        >
          ⤮ Shuffle
        </PillButton>
        <PillButton
          variant="light"
          size="sm"
          disabled={saving}
          onClick={onSave}
          className="min-h-11 flex-1"
        >
          {saving ? "Saving…" : "Save layout"}
        </PillButton>
      </div>

      <div
        ref={setRef}
        className="relative w-full"
        style={{ height: layout ? layout.height : undefined, minHeight: 160 }}
      >
        {layout?.rects.map((rect) => {
          const tile = tiles.find((t) => t.id === rect.id);
          if (!tile) return null;
          return (
            <div
              key={tile.id}
              className="absolute overflow-hidden rounded-lg bg-panel2"
              style={{
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
              }}
            >
              <Image
                src={tile.src}
                alt={tile.title}
                fill
                sizes="50vw"
                className="object-cover"
              />
              <span className="absolute top-1 left-1 rounded bg-inverse/70 px-1 py-0.5 font-medium text-[9px] text-on-inverse/90 backdrop-blur-sm">
                {presetLabel(tile.orientation, tile.colSpan)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl border border-line bg-panel px-4 py-3 text-[13px] text-fg/50">
        This is how the home page bento will look. To drag tiles and set
        individual sizes, open this page on a larger screen.
      </p>
    </div>
  );
}
