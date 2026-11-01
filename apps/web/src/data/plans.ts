import type { PlanMeta } from "@/types";

// Text (name, blurb, unit/price, includes) lives in messages under
// `pricing.plans.{id}`. The displayed price is the localized `unit` string
// (e.g. "from $250" / "à partir de 350 $") since amounts differ per locale.
export const plans: PlanMeta[] = [
  { id: "basic", highlighted: false },
  { id: "premium", highlighted: true },
  { id: "editorial", highlighted: false },
];
