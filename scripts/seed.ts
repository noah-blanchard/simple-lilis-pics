/**
 * Seed script — populates Supabase with demo projects for the project-centric
 * portfolio model.
 *
 *   1. Upserts the 8 taxonomy tags from specialties.ts (FR/EN labels from messages).
 *   2. Clean-slates the project tables (project_tags → project_photos → projects).
 *   3. Inserts 8 demo projects with mixed orientations, 1–4 photos each, ≤6 featured.
 *      All photos use legacy Unsplash URLs (resolveImageUrl returns them as-is).
 *
 * Run:  bun run seed
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { specialties } from "../src/data/specialties";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local)",
  );
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

type Messages = {
  specialty: { items: Record<string, { title: string }> };
};

const root = process.cwd();
const en = JSON.parse(
  readFileSync(join(root, "messages/en.json"), "utf8"),
) as Messages;
const fr = JSON.parse(
  readFileSync(join(root, "messages/fr.json"), "utf8"),
) as Messages;

// ── Demo project definitions ───────────────────────────────────────────────
// orientation: "landscape" = 16:9 wide  |  "portrait" = 9:16 tall
// cover_index: which photo in the array becomes the cover (0-based)
// featured: max 6 total across all projects

interface DemoPhoto {
  url: string;
  orientation: "landscape" | "portrait";
}

interface DemoProject {
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  project_date: string; // YYYY-MM-DD
  featured: boolean;
  cover_index: number;
  tag_slugs: string[];
  photos: DemoPhoto[];
}

const DEMO_PROJECTS: DemoProject[] = [
  {
    title_en: "Golden Hour Portraits",
    title_fr: "Portraits heure dorée",
    description_en: "A soft series shot during the last light of the day.",
    description_fr: "Une série douce captée dans les dernières lueurs du jour.",
    project_date: "2025-09-15",
    featured: true,
    cover_index: 0,
    tag_slugs: ["portrait"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1920&q=80",
        orientation: "portrait",
      },
      {
        url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1920&q=80",
        orientation: "portrait",
      },
      {
        url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1920&q=80",
        orientation: "landscape",
      },
    ],
  },
  {
    title_en: "Urban Geometry",
    title_fr: "Géométrie urbaine",
    description_en: "Lines, shadows, and textures found in the city.",
    description_fr: "Lignes, ombres et textures de la ville.",
    project_date: "2025-07-20",
    featured: true,
    cover_index: 0,
    tag_slugs: ["street"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80",
        orientation: "landscape",
      },
    ],
  },
  {
    title_en: "High Fashion Editorial",
    title_fr: "Editorial haute couture",
    description_en: "A bold editorial for an independent fashion label.",
    description_fr:
      "Un éditorial audacieux pour une marque de mode indépendante.",
    project_date: "2025-05-10",
    featured: true,
    cover_index: 1,
    tag_slugs: ["fashion", "portrait"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&q=80",
        orientation: "portrait",
      },
      {
        url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80",
        orientation: "portrait",
      },
      {
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=80",
        orientation: "landscape",
      },
    ],
  },
  {
    title_en: "Mountain Light",
    title_fr: "Lumière des sommets",
    description_en: "Landscape series from a week in the Alps.",
    description_fr: "Série de paysages lors d'une semaine dans les Alpes.",
    project_date: "2025-08-03",
    featured: true,
    cover_index: 0,
    tag_slugs: ["landscape"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80",
        orientation: "portrait",
      },
    ],
  },
  {
    title_en: "Summer Wedding",
    title_fr: "Mariage d'été",
    description_en: "Candid moments from a ceremony in Provence.",
    description_fr: "Instants spontanés d'une cérémonie en Provence.",
    project_date: "2025-06-28",
    featured: true,
    cover_index: 0,
    tag_slugs: ["event", "portrait"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80",
        orientation: "portrait",
      },
    ],
  },
  {
    title_en: "Macro Garden",
    title_fr: "Jardin macro",
    description_en: "Intimate details from a botanical garden at dawn.",
    description_fr: "Détails intimes d'un jardin botanique à l'aube.",
    project_date: "2025-04-12",
    featured: true,
    cover_index: 0,
    tag_slugs: ["macro"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1490750967868-88df5691cc36?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1444930694458-01babf71ab19?w=1920&q=80",
        orientation: "portrait",
      },
    ],
  },
  {
    title_en: "Product Still Life",
    title_fr: "Nature morte produit",
    description_en: "Clean product photography for a skincare brand.",
    description_fr:
      "Photographie produit épurée pour une marque de cosmétiques.",
    project_date: "2025-03-05",
    featured: false,
    cover_index: 0,
    tag_slugs: ["product"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1920&q=80",
        orientation: "portrait",
      },
      {
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1920&q=80",
        orientation: "landscape",
      },
    ],
  },
  {
    title_en: "Wildlife at Dusk",
    title_fr: "Faune au crépuscule",
    description_en: "A solitary hour in the wetlands.",
    description_fr: "Une heure solitaire dans les marais.",
    project_date: "2024-11-18",
    featured: false,
    cover_index: 0,
    tag_slugs: ["wildlife", "landscape"],
    photos: [
      {
        url: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1920&q=80",
        orientation: "landscape",
      },
      {
        url: "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1920&q=80",
        orientation: "portrait",
      },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // 1) Upsert tags
  const tagRows = specialties.map((s) => ({
    slug: s.id,
    label_en: en.specialty.items[s.id].title,
    label_fr: fr.specialty.items[s.id].title,
  }));
  const { error: tagErr } = await supabase
    .from("tags")
    .upsert(tagRows, { onConflict: "slug" });
  if (tagErr) throw new Error(`Tag upsert failed: ${tagErr.message}`);

  const { data: tags, error: tagFetchErr } = await supabase
    .from("tags")
    .select("id, slug");
  if (tagFetchErr || !tags)
    throw new Error(`Tag fetch failed: ${tagFetchErr?.message}`);
  const tagIdBySlug = new Map<string, string>(
    tags.map((t) => [t.slug as string, t.id as string]),
  );
  console.log(`✓ ${tags.length} tags ready`);

  // 2) Clean slate — delete in FK-safe order
  await supabase
    .from("project_tags")
    .delete()
    .neq("project_id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("project_photos")
    .delete()
    .neq("project_id", "00000000-0000-0000-0000-000000000000");
  // Cover FK must be null before we can delete projects
  await supabase
    .from("projects")
    .update({ cover_photo_id: null })
    .neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase
    .from("projects")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  console.log("✓ existing projects cleared");

  // 3) Insert demo projects
  let inserted = 0;
  for (const demo of DEMO_PROJECTS) {
    // a) Insert project (cover null for now)
    const { data: project, error: projErr } = await supabase
      .from("projects")
      .insert({
        title_en: demo.title_en,
        title_fr: demo.title_fr,
        description_en: demo.description_en,
        description_fr: demo.description_fr,
        project_date: demo.project_date,
        featured: demo.featured,
        cover_photo_id: null,
      })
      .select("id")
      .single();
    if (projErr || !project) {
      console.error(`✗ "${demo.title_en}": ${projErr?.message}`);
      continue;
    }
    const projectId = project.id as string;

    // b) Insert project_photos
    const photoRows = demo.photos.map((p, i) => ({
      project_id: projectId,
      image_path: p.url,
      orientation: p.orientation,
      position: i,
    }));
    const { data: insertedPhotos, error: photosErr } = await supabase
      .from("project_photos")
      .insert(photoRows)
      .select("id");
    if (photosErr || !insertedPhotos) {
      console.error(`  ! photos for "${demo.title_en}": ${photosErr?.message}`);
      continue;
    }

    // c) Set cover
    const coverId = (insertedPhotos[demo.cover_index] as { id: string }).id;
    await supabase
      .from("projects")
      .update({ cover_photo_id: coverId })
      .eq("id", projectId);

    // d) Insert project_tags
    const tagLinks = demo.tag_slugs
      .map((slug) => tagIdBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((tag_id) => ({ project_id: projectId, tag_id }));
    if (tagLinks.length > 0) {
      const { error: tagsErr } = await supabase
        .from("project_tags")
        .insert(tagLinks);
      if (tagsErr)
        console.error(`  ! tags for "${demo.title_en}": ${tagsErr.message}`);
    }

    inserted += 1;
    console.log(
      `  ✓ "${demo.title_en}" (${demo.photos.length} photo${demo.photos.length > 1 ? "s" : ""}${demo.featured ? ", featured" : ""})`,
    );
  }

  const featured = DEMO_PROJECTS.filter((p) => p.featured).length;
  console.log(`\n✓ ${inserted} projects inserted (${featured} featured)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
