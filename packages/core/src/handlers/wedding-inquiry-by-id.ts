import "server-only";
import { apiError, apiSuccess } from "../api/response";
import { weddingInquiryUpdateSchema } from "../api/schemas";
import { validate } from "../api/validate";
import { withAuth } from "../api/with-auth";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { WeddingInquiryRow } from "../types/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/wedding-inquiries/[id]: flip an inquiry between read and unread
 *  (authenticated). The client sends the intent; the clock stays server-side. */
export const updateWeddingInquiry = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(weddingInquiryUpdateSchema, body);
  if (!parsed.ok) return parsed.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_inquiries")
    .update({ read_at: parsed.data.read ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return apiError("DB_UPDATE_FAILED", error.message, 500);
  return apiSuccess<WeddingInquiryRow>(data as WeddingInquiryRow);
});

/** DELETE /api/wedding-inquiries/[id]: discard an inquiry (authenticated). */
export const deleteWeddingInquiry = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("wedding_inquiries").delete().eq("id", id);
  if (error) return apiError("DB_DELETE_FAILED", error.message, 500);
  return apiSuccess({ id });
});
