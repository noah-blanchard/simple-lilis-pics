// Shared motion/react tokens. Per the project mandate, ALL animation (including
// hover/focus micro-interactions) runs through motion/react rather than CSS or
// Tailwind `transition-*` utilities — these tokens keep the timing consistent.

/** Primary editorial easing curve used across entrance + micro animations. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Slow, weighty ease for the image hover-zoom. */
export const ZOOM_EASE = [0.2, 0.7, 0.2, 1] as const;

/** Section/element entrance reveals (whileInView). */
export const revealTransition = { duration: 0.8, ease: EASE } as const;

/** Quick color/border/opacity hover + focus feedback (replaces transition-colors). */
export const hoverColorTransition = { duration: 0.25, ease: EASE } as const;

/** On-hover reveal of overlay chrome (scrims, arrows, captions). */
export const hoverRevealTransition = { duration: 0.5, ease: EASE } as const;

/** Long, slow image hover-zoom (replaces the CSS .img-zoom transition). */
export const zoomTransition = { duration: 1.2, ease: ZOOM_EASE } as const;

/** Shared rest/hover variant labels for gesture propagation. */
export const REST = "rest";
export const HOVER = "hover";
