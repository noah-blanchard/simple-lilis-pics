import { apiError, apiSuccess } from "@/lib/api/response";
import { contactSchema } from "@/lib/api/schemas";
import { validate } from "@/lib/api/validate";
import { sendContactNotification } from "@/lib/mail/resend";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { ContactMessageRow } from "@/types/db";

/** POST /api/contact — public (no auth). The DB insert is the source of
 *  truth for the submission; the notification email is best-effort and
 *  never fails the request, since the message is already safely recorded
 *  even if Resend hiccups. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be JSON", 400);
  }

  const parsed = validate(contactSchema, body);
  if (!parsed.ok) return parsed.response;

  const { name, email, message, company } = parsed.data;

  // Honeypot: real visitors never see or fill this field. Pretend success
  // so bots don't learn their submission was rejected.
  if (company) {
    return apiSuccess({ id: "ok" }, { status: 201 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .insert({ name, email, message })
    .select("*")
    .single();
  if (error) return apiError("DB_INSERT_FAILED", error.message, 500);

  try {
    await sendContactNotification(parsed.data);
  } catch (err) {
    console.error("[contact] notification email failed:", err);
  }

  return apiSuccess<ContactMessageRow>(data as ContactMessageRow, {
    status: 201,
  });
}
