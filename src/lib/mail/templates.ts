import type { ContactInput } from "@/lib/api/schemas";

/** Escape text dropped into the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Branded HTML notification email for a new contact-form submission.
 *  Table-based layout with inline styles only — the safe subset that renders
 *  consistently across email clients (Outlook included). Echoes the site's
 *  warm-neutral / cognac palette (src/styles/theme.css) since email clients
 *  can't load the site's Tailwind theme or next/font faces. */
export function contactNotificationHtml({
  name,
  email,
  message,
}: Pick<ContactInput, "name" | "email" | "message">): string {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
  const receivedAt = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Toronto",
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>New inquiry — Lilis Pics</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #e4e4e4;">
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <p style="margin:0; font-family:'Courier New', ui-monospace, monospace; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:#9a5b1e;">
                  Lilis&middot;Pics
                </p>
                <h1 style="margin:12px 0 0 0; font-family:Georgia, 'Times New Roman', serif; font-size:26px; line-height:1.3; color:#171717; font-weight:normal;">
                  New inquiry from the site
                </h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ededed; border-radius:12px;">
                  <tr>
                    <td style="padding:20px 24px;">
                      <p style="margin:0 0 4px 0; font-family:'Courier New', ui-monospace, monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#5c5c5c;">Name</p>
                      <p style="margin:0 0 16px 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#171717;">${safeName}</p>
                      <p style="margin:0 0 4px 0; font-family:'Courier New', ui-monospace, monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#5c5c5c;">Email</p>
                      <p style="margin:0 0 16px 0; font-family:Arial, Helvetica, sans-serif; font-size:15px; color:#171717;">${safeEmail}</p>
                      <p style="margin:0 0 4px 0; font-family:'Courier New', ui-monospace, monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#5c5c5c;">Message</p>
                      <p style="margin:0; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:1.6; color:#171717;">${safeMessage}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px 40px;" align="left">
                <a href="mailto:${safeEmail}" style="display:inline-block; background-color:#9a5b1e; color:#ffffff; font-family:Arial, Helvetica, sans-serif; font-size:14px; text-decoration:none; padding:12px 26px; border-radius:999px;">
                  Reply to ${safeName}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 32px 40px; border-top:1px solid #e4e4e4; margin-top:8px;">
                <p style="margin:16px 0 0 0; font-family:Arial, Helvetica, sans-serif; font-size:12px; color:#5c5c5c;">
                  Received ${receivedAt} &middot; sent via the contact form at lilispics.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
