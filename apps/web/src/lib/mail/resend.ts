import "server-only";

import { Resend } from "resend";
import type { ContactInput } from "@/lib/api/schemas";
import { contactNotificationHtml } from "./templates";

/** Thrown when Resend or the sender/recipient env vars aren't configured.
 *  The route handler treats this as a non-fatal, best-effort failure. */
export class MailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailConfigError";
  }
}

/** Thrown when Resend accepts the request but reports a send failure. */
export class MailUpstreamError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailUpstreamError";
  }
}

/** Lazily-built singleton client, created on the first send once the API key
 *  has been validated. */
let client: Resend | null = null;

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new MailConfigError("Resend is not configured (RESEND_API_KEY)");
  }
  client ??= new Resend(apiKey);
  return client;
}

/** Send the "new contact form submission" notification email. Server-only.
 *  Throws MailConfigError if unconfigured, or MailUpstreamError if Resend
 *  rejects the send — the caller decides whether that should be fatal. */
export async function sendContactNotification(
  input: ContactInput,
): Promise<void> {
  const resend = getClient();
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!to || !from) {
    throw new MailConfigError(
      "Resend is not configured (CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL)",
    );
  }

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: input.email,
    subject: `New inquiry from ${input.name} — Lilis Pics`,
    html: contactNotificationHtml(input),
  });

  if (error) {
    throw new MailUpstreamError(error.message);
  }
}
