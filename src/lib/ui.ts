// Shared UI class tokens.

/** Text-input / textarea styling shared by the public contact form and the
 *  admin login form (identical). The admin ProjectForm uses tighter padding, so
 *  it deliberately keeps its own variant. */
export const FIELD_CLASS =
  "w-full rounded-2xl border border-line bg-panel2 px-5 py-4 text-[15px] text-fg placeholder:text-fg/40 outline-none";

/** Border colour applied on field focus (motion `whileFocus` target). */
export const FIELD_FOCUS = { borderColor: "var(--accent)" };
