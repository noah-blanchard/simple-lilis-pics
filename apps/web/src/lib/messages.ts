/** Read a raw array-of-strings message. next-intl's `t.raw` is untyped (returns
 *  `any`), so this centralizes the unavoidable `as string[]` assertion in one
 *  place rather than scattering it across sections. */
export function rawList(
  t: { raw: (key: string) => unknown },
  key: string,
): string[] {
  return t.raw(key) as string[];
}
