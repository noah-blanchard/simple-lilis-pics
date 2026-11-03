import type { Orientation } from "@lili/core/types/db";

/** One row of a story page. Mixing these breaks the sequence into a rhythm
 *  that follows the photos' own orientation (no chapters, D11). */
export type StoryRow<P> =
  | { kind: "full"; photos: [P] } // one landscape, full width
  | { kind: "pair"; photos: [P, P] } // two portraits, or two landscapes side by side
  | { kind: "triptych"; photos: [P, P, P] } // three portraits
  | { kind: "single"; photos: [P] }; // a lone portrait, centred, narrower

export function storyRhythm<P extends { orientation: Orientation }>(
  photos: P[],
): StoryRow<P>[] {
  const rows: StoryRow<P>[] = [];
  let i = 0;
  while (i < photos.length) {
    const orientation = photos[i].orientation;
    let j = i;
    while (j < photos.length && photos[j].orientation === orientation) j++;
    const run = photos.slice(i, j);
    i = j;

    if (orientation === "landscape") {
      // Alternate full width and pairs so long landscape runs don't read as a feed.
      let k = 0;
      let full = true;
      while (k < run.length) {
        if (full || run.length - k === 1) {
          rows.push({ kind: "full", photos: [run[k]] });
          k += 1;
        } else {
          rows.push({ kind: "pair", photos: [run[k], run[k + 1]] });
          k += 2;
        }
        full = !full;
      }
    } else {
      // Portraits group by three; four split as two pairs; leftovers pair or stand alone.
      let rest = run;
      while (rest.length > 0) {
        if (rest.length === 4) {
          rows.push(
            { kind: "pair", photos: [rest[0], rest[1]] },
            { kind: "pair", photos: [rest[2], rest[3]] },
          );
          rest = [];
        } else if (rest.length >= 3) {
          rows.push({
            kind: "triptych",
            photos: [rest[0], rest[1], rest[2]],
          });
          rest = rest.slice(3);
        } else if (rest.length === 2) {
          rows.push({ kind: "pair", photos: [rest[0], rest[1]] });
          rest = [];
        } else {
          rows.push({ kind: "single", photos: [rest[0]] });
          rest = [];
        }
      }
    }
  }
  return rows;
}
