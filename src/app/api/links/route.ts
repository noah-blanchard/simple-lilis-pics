import { revalidateTag } from "next/cache";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  ACCEPTED_IMAGE_TYPES,
  linksEditorSaveSchema,
  MAX_FILE_BYTES,
} from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { PHOTOS_BUCKET } from "@/lib/env";
import type {
  AdminLinksSnapshot,
  LinkClickStat,
  LinkRow,
  LinksPageSettingsRow,
} from "@/types/db";

async function readSnapshot(): Promise<
  { ok: true; data: AdminLinksSnapshot } | { ok: false; response: Response }
> {
  const admin = createSupabaseAdminClient();
  const [linksResult, statsResult, settingsResult] = await Promise.all([
    admin
      .from("links")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true }),
    admin.rpc("get_link_click_stats"),
    admin.from("links_page_settings").select("*").eq("id", 1).single(),
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
  if (settingsResult.error) {
    return {
      ok: false,
      response: apiError(
        "DB_SETTINGS_FAILED",
        settingsResult.error.message,
        500,
      ),
    };
  }

  return {
    ok: true,
    data: {
      links: (linksResult.data ?? []) as LinkRow[],
      stats: (statsResult.data ?? []) as LinkClickStat[],
      settings: settingsResult.data as LinksPageSettingsRow,
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
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return apiError(
      "INVALID_FORM_DATA",
      "Request body must be multipart form data",
      400,
    );
  }

  const snapshotValue = formData.get("snapshot");
  if (typeof snapshotValue !== "string")
    return apiError("INVALID_SNAPSHOT", "Missing editor snapshot", 400);

  let body: unknown;
  try {
    body = JSON.parse(snapshotValue);
  } catch {
    return apiError("INVALID_JSON", "Snapshot must be valid JSON", 400);
  }

  const parsed = validate(linksEditorSaveSchema, body);
  if (!parsed.ok) return parsed.response;

  const rawBanner = formData.get("banner");
  const banner =
    rawBanner instanceof File && rawBanner.size > 0 ? rawBanner : null;
  if (parsed.data.banner_action === "replace" && !banner) {
    return apiError("BANNER_REQUIRED", "A replacement banner is required", 422);
  }
  if (banner) {
    if (parsed.data.banner_action !== "replace")
      return apiError("UNEXPECTED_BANNER", "Banner file is not expected", 422);
    if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(banner.type))
      return apiError("INVALID_TYPE", "Unsupported banner image type", 422);
    if (banner.size > MAX_FILE_BYTES)
      return apiError("FILE_TOO_LARGE", "Banner must be at most 5 MB", 422);
  }

  const items = parsed.data.items.map((item, position) => ({
    ...item,
    position,
  }));
  const admin = createSupabaseAdminClient();
  const { data: currentSettings, error: currentSettingsError } = await admin
    .from("links_page_settings")
    .select("banner_image_path")
    .eq("id", 1)
    .single();
  if (currentSettingsError)
    return apiError("DB_SETTINGS_FAILED", currentSettingsError.message, 500);

  const oldBannerPath = currentSettings.banner_image_path as string | null;
  let newBannerPath: string | null = oldBannerPath;
  if (parsed.data.banner_action === "remove") newBannerPath = null;
  if (parsed.data.banner_action === "replace" && banner) {
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    };
    newBannerPath = `links/banners/${crypto.randomUUID()}.${extensions[banner.type]}`;
    const { error: uploadError } = await admin.storage
      .from(PHOTOS_BUCKET)
      .upload(newBannerPath, banner, {
        contentType: banner.type,
        upsert: false,
      });
    if (uploadError)
      return apiError("UPLOAD_FAILED", uploadError.message, 500);
  }

  const { error } = await admin.rpc("save_links_editor", {
    p_expected_items: parsed.data.expected_items,
    p_items: items,
    p_expected_settings_updated_at:
      parsed.data.expected_settings_updated_at,
    p_settings: {
      ...parsed.data.settings,
      banner_image_path: newBannerPath,
    },
  });

  if (error && newBannerPath && newBannerPath !== oldBannerPath) {
    await admin.storage.from(PHOTOS_BUCKET).remove([newBannerPath]);
  }
  if (error?.code === "40001") {
    return apiError(
      "EDIT_CONFLICT",
      "Links changed since this editor was loaded",
      409,
    );
  }
  if (error) return apiError("DB_SAVE_FAILED", error.message, 500);

  if (oldBannerPath && oldBannerPath !== newBannerPath) {
    const { error: cleanupError } = await admin.storage
      .from(PHOTOS_BUCKET)
      .remove([oldBannerPath]);
    if (cleanupError)
      console.error("[links] old banner cleanup failed:", cleanupError.message);
  }

  revalidateTag("public-links", { expire: 0 });
  const snapshot = await readSnapshot();
  return snapshot.ok ? apiSuccess(snapshot.data) : snapshot.response;
});
