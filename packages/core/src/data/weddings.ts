import { unstable_cache } from "next/cache";
import type { WeddingType } from "../api/schemas";
import { PUBLIC_WEDDINGS_TAG } from "../cache-tags";
import type { Locale } from "../i18n/routing";
import { createSupabasePublicClient } from "../supabase/public";
import {
  type ProjectWithRelations,
  type ResolvedProjectPhoto,
  resolveProject,
} from "../types/db";
import { PROJECT_SELECT, parseProjects } from "./parse";

/** A wedding story as the wedding site renders it. */
export interface ResolvedWeddingStory {
  slug: string;
  couple: string;
  venue: string; // "" when unset
  type: WeddingType;
  date: string | null; // ISO date; the app derives the season
  quote: string; // locale-specific; "" when unset
  cover: ResolvedProjectPhoto | null;
  photos: ResolvedProjectPhoto[];
}

let warnedMissingSchema = false;

/** Postgres "undefined column" / "undefined table": migration 0015 is not applied yet. */
function isMissingSchema(code: string | undefined) {
  return code === "42703" || code === "42P01";
}

const getStoryRows = unstable_cache(
  async (): Promise<ProjectWithRelations[]> => {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("wedding_story", true)
      .order("project_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      if (isMissingSchema(error.code)) {
        if (!warnedMissingSchema) {
          console.warn("[weddings] migration 0015 not applied; no stories yet");
        }
        warnedMissingSchema = true;
        return [];
      }
      throw new Error(`Failed to load wedding stories: ${error.message}`);
    }
    return parseProjects(data);
  },
  ["wedding-stories"],
  { tags: [PUBLIC_WEDDINGS_TAG], revalidate: 300 },
);

function resolveStory(
  row: ProjectWithRelations,
  locale: Locale,
): ResolvedWeddingStory | null {
  // The database check guarantees these on stories; skip anything that slipped through.
  if (!row.wedding_slug || !row.wedding_couple || !row.wedding_type)
    return null;
  const project = resolveProject(row, locale);
  return {
    slug: row.wedding_slug,
    couple: row.wedding_couple,
    venue: row.wedding_venue ?? "",
    type: row.wedding_type,
    date: row.project_date,
    quote:
      (locale === "fr" ? row.wedding_quote_fr : row.wedding_quote_en) ?? "",
    cover: project.cover,
    photos: project.photos,
  };
}

/** All published stories, newest first. */
export async function getWeddingStories(
  locale: Locale,
): Promise<ResolvedWeddingStory[]> {
  return (await getStoryRows())
    .map((row) => resolveStory(row, locale))
    .filter((s): s is ResolvedWeddingStory => s !== null);
}

/** One story by slug, plus the next one (wrapping) for the "next story" link. */
export async function getWeddingStory(slug: string, locale: Locale) {
  const stories = await getWeddingStories(locale);
  const index = stories.findIndex((s) => s.slug === slug);
  if (index === -1) return null;
  const next =
    stories.length > 1 ? stories[(index + 1) % stories.length] : null;
  return { story: stories[index], next };
}
