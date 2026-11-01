import { apiError, apiSuccess } from "@/lib/api/response";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type Ctx = { params: Promise<{ id: string }> };

/** Best-effort same-origin click signal. Navigation never waits for this. */
export async function POST(request: Request, { params }: Ctx) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (origin !== new URL(request.url).origin || fetchSite === "cross-site") {
    return apiError("FORBIDDEN", "Same-origin request required", 403);
  }

  const { id } = await params;
  const uuid = zUuid(id);
  if (!uuid) return apiError("LINK_NOT_FOUND", "Link not found", 404);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("record_link_click", {
    p_link_id: uuid,
  });
  if (error) return apiError("DB_CLICK_FAILED", error.message, 500);
  if (!data) return apiError("LINK_NOT_FOUND", "Link not found", 404);

  return apiSuccess({ accepted: true }, { status: 202 });
}

function zUuid(value: string): string | null {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
    ? value
    : null;
}
