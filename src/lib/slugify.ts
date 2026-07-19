/** Convert text into a lowercase, DB-safe slug (letters, digits, single
 *  dashes). Diacritics are stripped first (NFD decomposition + removing
 *  combining marks) so accented input still slugifies cleanly. Returns "" if
 *  nothing slug-worthy remains — callers decide the fallback. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
