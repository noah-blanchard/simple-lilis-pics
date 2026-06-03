/**
 * Seed / migration script — populates Supabase from the legacy static data.
 *
 *   1. Upserts the 8 taxonomy tags from `src/data/specialties.ts`, with FR/EN
 *      labels taken from `messages/{en,fr}.json` (`specialty.items.{slug}`).
 *   2. Migrates the 24 legacy projects into `photos`:
 *        - year -> shoot_date "YYYY-01-01"
 *        - keeps the Unsplash URL in `image_path` (resolveImageUrl returns it as-is)
 *        - FR/EN titles from `messages`
 *        - best-effort mapping of legacy free-text tags -> taxonomy slugs
 *      Photos already present (matched by image_path) are skipped, so the
 *      script is safe to re-run.
 *
 * Run:  bun run seed   (loads .env.local automatically)
 *
 * NOTE: the legacy tag mapping below is a manual reconciliation — review and
 * adjust each photo's tags in the /admin UI afterwards if needed.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { projects } from "../src/data/projects";
import { specialties } from "../src/data/specialties";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)");
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

type Messages = {
  specialty: { items: Record<string, { title: string }> };
  portfolio: { projects: Record<string, { title: string; tags: string }> };
};

const root = process.cwd();
const en = JSON.parse(readFileSync(join(root, "messages/en.json"), "utf8")) as Messages;
const fr = JSON.parse(readFileSync(join(root, "messages/fr.json"), "utf8")) as Messages;

/** Best-effort: each legacy project -> taxonomy slug(s). Review in /admin. */
const TAGS_BY_PROJECT: Record<number, string[]> = {
  1: ["portrait"],
  2: ["portrait"],
  3: ["event"],
  4: ["landscape"],
  5: ["fashion"],
  6: ["street"],
  7: ["portrait"],
  8: ["street"],
  9: ["fashion"],
  10: ["landscape"],
  11: ["landscape"],
  12: ["portrait"],
  13: ["fashion"],
  14: ["fashion"],
  15: ["landscape"],
  16: ["street"],
  17: ["street"],
  18: ["portrait"],
  19: ["fashion"],
  20: ["landscape"],
  21: ["macro"],
  22: ["street"],
  23: ["portrait"],
  24: ["landscape"],
};

async function main() {
  // 1) Tags
  const tagRows = specialties.map((s) => ({
    slug: s.id,
    label_en: en.specialty.items[s.id].title,
    label_fr: fr.specialty.items[s.id].title,
  }));
  const { error: tagErr } = await supabase.from("tags").upsert(tagRows, { onConflict: "slug" });
  if (tagErr) throw new Error(`Tag upsert failed: ${tagErr.message}`);

  const { data: tags, error: tagFetchErr } = await supabase.from("tags").select("id, slug");
  if (tagFetchErr || !tags) throw new Error(`Tag fetch failed: ${tagFetchErr?.message}`);
  const tagIdBySlug = new Map<string, string>(tags.map((t) => [t.slug as string, t.id as string]));
  console.log(`✓ ${tags.length} tags ready`);

  // 2) Photos (skip already-seeded by image_path)
  const { data: existing } = await supabase.from("photos").select("image_path");
  const existingPaths = new Set((existing ?? []).map((p) => p.image_path as string));

  let inserted = 0;
  for (const p of projects) {
    if (existingPaths.has(p.img)) continue;

    const { data: photo, error: insErr } = await supabase
      .from("photos")
      .insert({
        title_en: en.portfolio.projects[p.id].title,
        title_fr: fr.portfolio.projects[p.id].title,
        shoot_date: `${p.year}-01-01`,
        image_path: p.img,
        featured: p.featured,
      })
      .select("id")
      .single();
    if (insErr || !photo) {
      console.error(`✗ project ${p.id}: ${insErr?.message}`);
      continue;
    }

    const slugs = TAGS_BY_PROJECT[p.id] ?? [];
    const links = slugs
      .map((slug) => tagIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((tag_id) => ({ photo_id: photo.id as string, tag_id }));
    if (links.length > 0) {
      const { error: linkErr } = await supabase.from("photo_tags").insert(links);
      if (linkErr) console.error(`  ! tags for project ${p.id}: ${linkErr.message}`);
    }
    inserted += 1;
  }

  console.log(`✓ ${inserted} photos inserted (${existingPaths.size} skipped as existing)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
