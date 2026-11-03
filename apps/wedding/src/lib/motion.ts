import { EASE } from "@lili/ui/lib/motion";

// Wedding-only timings, all on the shared EASE (02-design-decisions §7).
export const FLASH_FROM = "brightness(2.6) contrast(0.7)";
export const FLASH_TO = "brightness(1) contrast(1)";
export const flashTransition = { duration: 0.6, ease: EASE } as const;

export const crossfadeTransition = { duration: 0.5, ease: EASE } as const;
export const disclosureTransition = { duration: 0.4, ease: EASE } as const;

/** Seal-the-reply sequence, seconds from success. */
export const SEAL = {
  cardIn: { duration: 0.5, ease: EASE },
  flap: { duration: 0.45, ease: EASE, delay: 0.5 },
  sealAt: 1.0,
  postmark: { duration: 0.3, ease: EASE, delay: 1.45 },
  copyAt: 1.7,
} as const;
