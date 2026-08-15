import { apiError, apiSuccess } from "@/lib/api/response";
import { contactUpdateSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { withAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ContactMessageRow } from "@/types/db";

type Ctx = { params: Promise<{ id: string }> };

/** PATCH /api/contact/[id] — flip a message between read and unread
 *  (authenticated). The client sends the intent (`read`), not a timestamp, so
 *  the clock stays server-side. */
export const PATCH = withAuth<Ctx>(async ({ request, ctx }) => {
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(contactUpdateSchema, body);
  if (!parsed.ok) return parsed.response;

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .update({ read_at: parsed.data.read ? new Date().toISOString() : null })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return apiError("DB_UPDATE_FAILED", error.message, 500);
  return apiSuccess<ContactMessageRow>(data as ContactMessageRow);
});

/** DELETE /api/contact/[id] — discard an enquiry (authenticated). */
export const DELETE = withAuth<Ctx>(async ({ ctx }) => {
  const { id } = await ctx.params;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("contact_messages").delete().eq("id", id);
  if (error) return apiError("DB_DELETE_FAILED", error.message, 500);
  return apiSuccess({ id });
});
