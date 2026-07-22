/** Shared domain types. The `*Meta` types describe the structural (non-text)
 *  data held in `src/data` — shaped like an API response. The fully-resolved
 *  types add the translated strings merged in by section containers. */

export type IconKind =
  | "landscape"
  | "street"
  | "portrait"
  | "fashion"
  | "event";

export type PillVariant = "light" | "dark" | "accent" | "ghost" | "danger";

/* ── Specialty ── */
export interface SpecialtyMeta {
  id: IconKind;
  image: string;
}
export interface Specialty extends SpecialtyMeta {
  title: string;
  desc: string;
}

/* ── Process step ── */
export interface ProcessStepMeta {
  n: string;
  img: string;
}
export interface ProcessStep extends ProcessStepMeta {
  title: string;
  body: string;
  bullets: string[];
}

/* ── Pricing plan ── */
export interface PlanMeta {
  id: string;
  highlighted: boolean;
}
export interface Plan extends PlanMeta {
  name: string;
  blurb: string;
  unit: string;
  includes: string[];
}

/* ── Testimonial ── */
export interface ReviewMeta {
  id: string;
  avatar: string;
}
export interface Review extends ReviewMeta {
  name: string;
  role: string;
  quote: string;
}

/* ── Contact form ── */
export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
  /** Honeypot — real users never see or fill this field. Non-empty means bot. */
  company?: string;
}
