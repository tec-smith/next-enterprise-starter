import { escapeHtml } from "@/lib/utils";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

interface ActionEmailOptions {
  appName: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string;
  footnote: string;
}

/** A plain, client-safe layout with one call-to-action button. */
function actionEmail({
  appName,
  heading,
  body,
  actionLabel,
  actionUrl,
  footnote,
}: ActionEmailOptions) {
  const url = escapeHtml(actionUrl);
  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f5f5f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#171717">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px">
      <tr><td>
        <p style="margin:0 0 24px;font-size:14px;color:#737373">${escapeHtml(appName)}</p>
        <h1 style="margin:0 0 16px;font-size:20px">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${escapeHtml(body)}</p>
        <a href="${url}" style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600">${escapeHtml(actionLabel)}</a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#737373">${escapeHtml(footnote)}</p>
        <p style="margin:16px 0 0;font-size:12px;color:#a3a3a3;word-break:break-all">${url}</p>
      </td></tr>
    </table>
  </body>
</html>`;
  const text = `${heading}\n\n${body}\n\n${actionLabel}: ${actionUrl}\n\n${footnote}\n`;
  return { html, text };
}

export function verificationEmail(
  appName: string,
  url: string,
  name?: string | null,
): EmailContent {
  return {
    subject: `Verify your email for ${appName}`,
    ...actionEmail({
      appName,
      heading: name ? `Welcome, ${name}` : "Welcome",
      body: "Confirm your email address to finish setting up your account.",
      actionLabel: "Verify email",
      actionUrl: url,
      footnote:
        "This link expires in 24 hours. If you didn't create an account, you can ignore this email.",
    }),
  };
}

export function passwordResetEmail(
  appName: string,
  url: string,
  name?: string | null,
): EmailContent {
  return {
    subject: `Reset your ${appName} password`,
    ...actionEmail({
      appName,
      heading: name ? `Hi ${name}` : "Reset your password",
      body: "We received a request to reset your password. Choose a new one with the link below.",
      actionLabel: "Reset password",
      actionUrl: url,
      footnote:
        "This link expires in 1 hour. If you didn't ask for a reset, you can ignore this email; your password won't change.",
    }),
  };
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
