import type { SpecialtyMeta } from "@/types";

// Order matches the reference grid. Text lives in messages/{locale}.json
// under `specialty.items.{id}`.
export const specialties: SpecialtyMeta[] = [
  { id: "landscape" },
  { id: "street" },
  { id: "product" },
  { id: "portrait" },
  { id: "fashion" },
  { id: "macro" },
  { id: "event" },
  { id: "wildlife" },
];
