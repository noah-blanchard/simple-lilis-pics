"use client";

import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { EASE } from "@/lib/motion";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_CLICK_SCALE = 2.5;

// Movement (px) past which a press is treated as a drag/swipe, not a tap.
const TAP_MOVE_THRESHOLD = 8;
// Horizontal travel (px) needed to count as a prev/next swipe (only when unzoomed).
const SWIPE_THRESHOLD = 50;

interface ZoomableImageProps {
  src: string;
  alt: string;
  /** When this changes (e.g. the photo id), the zoom/pan resets to fit. */
  resetKey: string | number;
  priority?: boolean;
  sizes?: string;
  /** Called once the underlying image has decoded (or errored). */
  onLoaded?: () => void;
  /** A clean tap (no drag, not a double-click) on the image — e.g. toggle chrome. */
  onTap?: () => void;
  /** Horizontal swipe while unzoomed: dir 1 = next, -1 = previous. */
  onSwipe?: (dir: number) => void;
}

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

/**
 * Fullscreen photo with cursor-centered scroll/pinch zoom and drag-to-pan,
 * scoped entirely to the image — wheel events are captured so the page itself
 * never zooms or scrolls. Includes basic download deterrence (no right-click,
 * no drag-save, no selection).
 */
export function ZoomableImage({
  src,
  alt,
  resetKey,
  priority,
  sizes,
  onLoaded,
  onTap,
  onSwipe,
}: ZoomableImageProps) {
  const prefersReduced = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const scale = useMotionValue(1);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Motion drag controls — panning is delegated entirely to motion's drag
  // system so it works reliably on mobile (avoids unreliable movementX/Y).
  const dragControls = useDragControls();

  // Natural pixel dimensions of the loaded image, used to compute the
  // contained ("fit") box so panning can be clamped to the image's own edges.
  const natural = useRef<{ w: number; h: number } | null>(null);
  // Active pointers, keyed by pointerId — drives pinch (2 pointers) detection.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef(0);
  // Press tracking to tell taps from drags/swipes, and to debounce single vs
  // double click.
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pan bounds for a given scale, derived from the container + contained image.
  const bounds = useCallback((s: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { maxX: 0, maxY: 0, rect: null, cW: 0, cH: 0 };
    const cW = rect.width;
    const cH = rect.height;
    let fitW = cW;
    let fitH = cH;
    const nat = natural.current;
    if (nat) {
      const aspect = nat.w / nat.h;
      if (cW / cH > aspect) {
        fitH = cH;
        fitW = cH * aspect;
      } else {
        fitW = cW;
        fitH = cW / aspect;
      }
    }
    return {
      maxX: Math.max(0, (fitW * s - cW) / 2),
      maxY: Math.max(0, (fitH * s - cH) / 2),
      rect,
      cW,
      cH,
    };
  }, []);

  const apply = useCallback(
    (s: number, nx: number, ny: number, animated: boolean) => {
      if (animated && !prefersReduced) {
        animate(scale, s, { duration: 0.32, ease: EASE });
        animate(x, nx, { duration: 0.32, ease: EASE });
        animate(y, ny, { duration: 0.32, ease: EASE });
      } else {
        scale.set(s);
        x.set(nx);
        y.set(ny);
      }
    },
    [prefersReduced, scale, x, y],
  );

  // Zoom by `factor` while keeping the point under (clientX, clientY) fixed.
  const zoomAt = useCallback(
    (factor: number, clientX: number, clientY: number, animated: boolean) => {
      const cur = scale.get();
      const next = clampScale(cur * factor);
      if (next === cur) return;
      const b = bounds(next);
      if (!b.rect) return;
      // Pointer position relative to the container's center.
      const px = clientX - b.rect.left - b.cW / 2;
      const py = clientY - b.rect.top - b.cH / 2;
      // Keep the image-space point under the cursor stationary.
      const nx = px - (px - x.get()) * (next / cur);
      const ny = py - (py - y.get()) * (next / cur);
      const clampedX = Math.min(b.maxX, Math.max(-b.maxX, nx));
      const clampedY = Math.min(b.maxY, Math.max(-b.maxY, ny));
      apply(next, clampedX, clampedY, animated);
    },
    [apply, bounds, scale, x, y],
  );

  // Reset to fit whenever the photo changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset is keyed on the photo, not the motion values.
  useEffect(() => {
    apply(1, 0, 0, true);
  }, [resetKey, apply]);

  // Native wheel listener (React's onWheel is passive and can't preventDefault),
  // so scrolling over the image zooms it instead of the page.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      zoomAt(factor, e.clientX, e.clientY, false);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y);

  // Clean up a pending single-tap timer on unmount.
  useEffect(
    () => () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    },
    [],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) {
      pressStart.current = { x: e.clientX, y: e.clientY };
      moved.current = false;
      if (scale.get() > MIN_SCALE + 0.001) {
        // Zoomed in: hand panning off to motion's drag system (reliable on mobile).
        dragControls.start(e);
      } else {
        // Not zoomed: capture pointer ourselves for swipe detection.
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    } else if (pointers.current.size === 2) {
      moved.current = true; // a pinch is never a tap
      e.currentTarget.setPointerCapture(e.pointerId);
      const [a, b] = [...pointers.current.values()];
      pinchDist.current = dist(a, b);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const s = pressStart.current;
    if (
      s &&
      Math.hypot(e.clientX - s.x, e.clientY - s.y) > TAP_MOVE_THRESHOLD
    ) {
      moved.current = true;
    }

    if (pointers.current.size === 2) {
      // Pinch-to-zoom — motion drag handles single-finger panning.
      const [a, b] = [...pointers.current.values()];
      const next = dist(a, b);
      if (pinchDist.current > 0) {
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        zoomAt(next / pinchDist.current, midX, midY, false);
      }
      pinchDist.current = next;
    }
  };

  // Called by motion on every drag frame; clamps x/y to the image's pan bounds.
  const onDragHandler = useCallback(() => {
    const b = bounds(scale.get());
    x.set(Math.min(b.maxX, Math.max(-b.maxX, x.get())));
    y.set(Math.min(b.maxY, Math.max(-b.maxY, y.get())));
  }, [bounds, scale, x, y]);

  const onPointerUp = (e: React.PointerEvent) => {
    const wasLast = pointers.current.size === 1;
    const start = pressStart.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = 0;

    // Unzoomed horizontal swipe → previous/next.
    if (wasLast && start && scale.get() <= MIN_SCALE + 0.001) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        onSwipe?.(dx < 0 ? 1 : -1);
      }
    }
    if (wasLast) pressStart.current = null;
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinchDist.current = 0;
    pressStart.current = null;
  };

  // Single click (not a drag/swipe) toggles chrome — debounced so a double
  // click zooms instead of toggling.
  const onClick = () => {
    if (moved.current || !onTap) return;
    if (tapTimer.current) return;
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      onTap();
    }, 230);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
    }
    if (scale.get() > 1) {
      apply(1, 0, 0, true);
    } else {
      zoomAt(DOUBLE_CLICK_SCALE, e.clientX, e.clientY, true);
    }
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: image viewport; keyboard nav lives in the parent gallery.
    // biome-ignore lint/a11y/useKeyWithClickEvents: pointer-driven image viewer; keyboard nav (arrows) is handled by the parent gallery.
    <div
      ref={containerRef}
      className="no-save relative h-full w-full touch-none select-none overflow-hidden"
      style={{ overscrollBehavior: "contain" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={endPointer}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0}
        onDrag={onDragHandler}
        className="relative h-full w-full cursor-zoom-in active:cursor-grabbing"
        style={{ scale, x, y }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          draggable={false}
          className="no-save object-contain"
          onLoad={(e) => {
            natural.current = {
              w: e.currentTarget.naturalWidth,
              h: e.currentTarget.naturalHeight,
            };
            onLoaded?.();
          }}
          onError={() => onLoaded?.()}
        />
      </motion.div>
    </div>
  );
}
