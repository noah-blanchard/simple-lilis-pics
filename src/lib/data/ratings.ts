import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type RatingRow, type ResolvedRating, resolveRating } from "@/types/db";

/** Only the columns the public cards render — never `token_id`, and never the
 *  rows' internal flags. Reads go through the anon client, so the
 *  "public read approved ratings" RLS policy is the real boundary; this select
 *  just keeps the payload minimal. */
const PUBLIC_RATING_SELECT = "id, stars, note, name, locale, created_at";

const publicRatingRow = z.object({
  id: z.string(),
  stars: z.number(),
  note: z.string().nullable(),
  name: z.string().nullable(),
  locale: z.enum(["en", "fr"]),
  created_at: z.string(),
});

/** Same soft-fail contract as `src/lib/data/parse.ts`: log the drift, fall back
 *  to the raw rows, never take the home page down over a schema mismatch. */
function parseRatings(data: unknown): RatingRow[] {
  const result = z.array(publicRatingRow).safeParse(data ?? []);
  if (!result.success) {
    console.error("[data] rating shape drift:", result.error.issues);
    return (data ?? []) as unknown as RatingRow[];
  }
  return result.data as unknown as RatingRow[];
}

/** Approved ratings that actually carry a written note — a testimonial card
 *  with no quote is just an avatar. Newest first. */
export async function getApprovedRatings(
  limit = 12,
): Promise<ResolvedRating[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ratings")
    .select(PUBLIC_RATING_SELECT)
    .eq("approved", true)
    .not("note", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load ratings: ${error.message}`);

  return parseRatings(data)
    .filter((row) => row.note?.trim())
    .map(resolveRating);
}
