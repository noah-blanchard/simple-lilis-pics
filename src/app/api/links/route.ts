import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/api/response";
import { linksEditorSaveSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AdminLinksSnapshot, LinkClickStat, LinkRow } from "@/types/db";

async function readSnapshot(): Promise<
  { ok: true; data: AdminLinksSnapshot } | { ok: false; response: Response }
> {
  const admin = createSupabaseAdminClient();
  const [linksResult, statsResult] = await Promise.all([
    admin
      .from("links")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    admin.rpc("get_link_click_stats"),
  ]);

  if (linksResult.error) {
    return {
      ok: false,
      response: apiError("DB_SELECT_FAILED", linksResult.error.message, 500),
    };
  }
  if (statsResult.error) {
    return {
      ok: false,
      response: apiError("DB_STATS_FAILED", statsResult.error.message, 500),
    };
  }

  return {
    ok: true,
    data: {
      links: (linksResult.data ?? []) as LinkRow[],
      stats: (statsResult.data ?? []) as LinkClickStat[],
    },
  };
}

/** Authenticated WYSIWYG snapshot: content and per-link summary statistics. */
export const GET = withAuth(async () => {
  const snapshot = await readSnapshot();
  return snapshot.ok ? apiSuccess(snapshot.data) : snapshot.response;
});

/** Atomically reconcile the whole editor draft, including order and deletes. */
export const PUT = withAuth(async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(linksEditorSaveSchema, body);
  if (!parsed.ok) return parsed.response;

  const items = parsed.data.items.map((item, position) => ({
    ...item,
    position,
  }));
  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc("save_links_editor", {
    p_expected_items: parsed.data.expected_items,
    p_items: items,
  });

  if (error?.code === "40001") {
    return apiError(
      "EDIT_CONFLICT",
      "Links changed since this editor was loaded",
      409,
    );
  }
  if (error) return apiError("DB_SAVE_FAILED", error.message, 500);

  revalidateTag("public-links", { expire: 0 });
  const snapshot = await readSnapshot();
  return snapshot.ok ? apiSuccess(snapshot.data) : snapshot.response;
});
