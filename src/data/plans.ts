import type { PlanMeta } from "@/types";

// Text (name, blurb, unit, includes) lives in messages under
// `pricing.plans.{id}`. Price is a structural value.
export const plans: PlanMeta[] = [
  { id: "basic", price: "150", highlighted: false },
  { id: "premium", price: "350", highlighted: true },
  { id: "editorial", price: "1200", highlighted: false },
];
