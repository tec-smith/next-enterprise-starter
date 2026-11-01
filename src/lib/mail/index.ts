import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { siteConfig } from "@/config/site";
import {
  passwordResetEmail,
  verificationEmail,
  type EmailContent,
} from "@/lib/mail/templates";

let transporter: Transporter | undefined;

function transport(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // Port 465 is TLS from the start; other ports may upgrade with STARTTLS.
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD }
      : undefined,
    // A serverless function shouldn't hang on a slow or unreachable server.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/**
 * Sends an email over SMTP. Without SMTP_HOST (local development) the email
 * is logged instead, including its text body so links can be followed.
 */
export async function sendEmail(
  to: string,
  content: EmailContent,
): Promise<boolean> {
  if (!env.SMTP_HOST) {
    if (env.NODE_ENV === "production") {
      logger.error("SMTP_HOST is not set; email not sent", {
        subject: content.subject,
      });
      return false;
    }
    logger.info(
      `Email (SMTP not configured) to ${to}: ${content.subject}\n\n${content.text}`,
    );
    return true;
  }

  try {
    await transport().sendMail({ from: env.MAIL_FROM, to, ...content });
    return true;
  } catch (error) {
    logger.error("Failed to send email", {
      subject: content.subject,
      error: String(error),
    });
    return false;
  }
}

export function sendVerificationEmail(
  to: string,
  token: string,
  name?: string | null,
) {
  const url = new URL(`/verify-email?token=${token}`, env.APP_URL).toString();
  return sendEmail(to, verificationEmail(siteConfig.name, url, name));
}

export function sendPasswordResetEmail(
  to: string,
  token: string,
  name?: string | null,
) {
  const url = new URL(`/reset-password?token=${token}`, env.APP_URL).toString();
  return sendEmail(to, passwordResetEmail(siteConfig.name, url, name));
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
