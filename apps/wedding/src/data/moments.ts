import type { PlaceholderKey } from "./placeholder-photos";

export type MomentKey =
  | "getting-ready"
  | "first-look"
  | "ceremony"
  | "family"
  | "portraits"
  | "golden-hour"
  | "speeches"
  | "last-dance";

export interface MomentMeta {
  key: MomentKey;
  /** Minutes since midnight (02-design-decisions §8). */
  minutes: number;
  tone: "day" | "dusk" | "night";
  photo: PlaceholderKey;
}

// Placeholder photographs (repeats are fine until real wedding photos exist).
// The darkest images sit on the night moments.
export const MOMENTS: MomentMeta[] = [
  { key: "getting-ready", minutes: 11 * 60, tone: "day", photo: "portrait01" },
  { key: "first-look", minutes: 14 * 60, tone: "day", photo: "landscape01" },
  { key: "ceremony", minutes: 15 * 60 + 30, tone: "day", photo: "portrait01" },
  { key: "family", minutes: 16 * 60 + 15, tone: "day", photo: "landscape01" },
  { key: "portraits", minutes: 17 * 60, tone: "day", photo: "portrait02" },
  {
    key: "golden-hour",
    minutes: 19 * 60 + 30,
    tone: "dusk",
    photo: "portrait02",
  },
  {
    key: "speeches",
    minutes: 20 * 60 + 30,
    tone: "night",
    photo: "portrait05",
  },
  {
    key: "last-dance",
    minutes: 23 * 60 + 40,
    tone: "night",
    photo: "portrait04",
  },
];
