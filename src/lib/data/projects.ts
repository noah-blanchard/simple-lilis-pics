import type { Locale } from "@/i18n/routing";
import { PROJECT_SELECT, parseProject, parseProjects } from "@/lib/data/parse";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  type ProjectWithRelations,
  type ResolvedProject,
  resolveProject,
} from "@/types/db";

async function fetchProjects(opts: {
  featuredOnly?: boolean;
  limit?: number;
}): Promise<ProjectWithRelations[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("project_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (opts.featuredOnly) query = query.eq("featured", true);
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return parseProjects(data);
}

/** Home page — featured projects (capped at 6), locale-resolved. */
export async function getFeaturedProjects(
  locale: Locale,
  limit = 6,
): Promise<ResolvedProject[]> {
  const rows = await fetchProjects({ featuredOnly: true, limit });
  return rows.map((row) => resolveProject(row, locale));
}

/** /portfolio — full archive, locale-resolved. */
export async function getAllProjects(
  locale: Locale,
): Promise<ResolvedProject[]> {
  const rows = await fetchProjects({});
  return rows.map((row) => resolveProject(row, locale));
}

/** /portfolio/[id] — single project. Returns null if not found (caller notFound()). */
export async function getProject(
  id: string,
  locale: Locale,
): Promise<ResolvedProject | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load project: ${error.message}`);
  if (!data) return null;
  return resolveProject(parseProject(data), locale);
}
