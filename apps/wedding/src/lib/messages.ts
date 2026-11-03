/** Read a raw array-of-strings message. next-intl's `t.raw` is untyped (returns
 *  `any`), so this centralizes the unavoidable `as string[]` assertion in one
 *  place rather than scattering it across sections. */
export function rawList(
  t: { raw: (key: string) => unknown },
  key: string,
): string[] {
  return t.raw(key) as string[];
}

/** Read a raw structured message (array of objects). next-intl's `t.raw` is
 *  untyped, so the one unavoidable assertion lives here. */
export function rawItems<T>(
  t: { raw: (key: string) => unknown },
  key: string,
): T[] {
  return t.raw(key) as T[];
}
