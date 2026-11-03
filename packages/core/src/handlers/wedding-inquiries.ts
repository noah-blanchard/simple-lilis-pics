import "server-only";
import { apiError, apiSuccess } from "../api/response";
import { MIN_INQUIRY_FILL_MS, weddingInquirySchema } from "../api/schemas";
import { validate } from "../api/validate";
import { withAuth } from "../api/with-auth";
import { sendWeddingInquiryNotification } from "../mail/resend";
import { createSupabaseAdminClient } from "../supabase/admin";
import type { WeddingInquiryRow } from "../types/db";

/** GET /api/wedding-inquiries: the admin inbox (authenticated). Private
 *  visitor submissions, so there is no public read. */
export const listWeddingInquiries = withAuth(async () => {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return apiError("DB_SELECT_FAILED", error.message, 500);
  return apiSuccess<WeddingInquiryRow[]>((data ?? []) as WeddingInquiryRow[]);
});

/** POST /api/inquiry, public on the wedding app. The DB insert is the source
 *  of truth; the notification email is best effort and never fails the request. */
export async function submitWeddingInquiry(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(weddingInquirySchema, body);
  if (!parsed.ok) return parsed.response;
  const { company, started_at, consent: _consent, ...fields } = parsed.data;

  // Honeypot, or a card filled faster than a person can: pretend success so
  // bots don't learn they were rejected.
  if (company || Date.now() - started_at < MIN_INQUIRY_FILL_MS) {
    return apiSuccess({ id: "ok" }, { status: 201 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("wedding_inquiries")
    .insert({
      ...fields,
      wedding_date: fields.date_unset ? null : fields.wedding_date,
      consent_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error) return apiError("DB_INSERT_FAILED", error.message, 500);

  try {
    await sendWeddingInquiryNotification(data as WeddingInquiryRow);
  } catch (err) {
    console.error("[wedding-inquiry] notification email failed:", err);
  }

  // The public endpoint returns only the id; the row stays private.
  return apiSuccess({ id: (data as WeddingInquiryRow).id }, { status: 201 });
}
