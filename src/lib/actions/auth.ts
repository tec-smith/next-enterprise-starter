"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError, CredentialsSignin } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import { safeCallbackUrl } from "@/lib/routes";
import { consumeToken, issueToken } from "@/lib/tokens";
import {
  invalid,
  tooManyRequests,
  type ActionResult,
} from "@/lib/actions/result";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validation/auth";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const signInLimiter = createRateLimiter({
  limit: 10,
  windowMs: FIFTEEN_MINUTES,
});
const emailLimiter = createRateLimiter({ limit: 5, windowMs: FIFTEEN_MINUTES });

async function clientIp() {
  return getClientIp(await headers());
}

export async function signInAction(
  values: SignInInput,
  callbackUrl?: string | null,
): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const { email, password } = parsed.data;

  if (!signInLimiter(`${await clientIp()}:${email}`).allowed)
    return tooManyRequests;

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (
      error instanceof CredentialsSignin &&
      error.code === "email_not_verified"
    ) {
      await resendVerification(email);
      return {
        ok: false,
        error:
          "Please verify your email first. We've sent you a new verification link.",
      };
    }
    if (error instanceof AuthError) {
      return { ok: false, error: "Incorrect email or password." };
    }
    throw error;
  }

  // Outside the try: redirect() works by throwing.
  redirect(safeCallbackUrl(callbackUrl, new URL(env.APP_URL).origin));
}

export async function signUpAction(values: SignUpInput): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const { name, email, password } = parsed.data;

  if (!emailLimiter(`signup:${await clientIp()}`).allowed)
    return tooManyRequests;

  // The same reply whether or not the email is registered, so the form can't
  // be used to discover who has an account.
  const done: ActionResult = {
    ok: true,
    message: "Check your inbox for a link to verify your email address.",
  };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    if (!existing.emailVerified) await resendVerification(email);
    return done;
  }

  const user = await db.user.create({
    data: { name, email, passwordHash: await hashPassword(password) },
  });
  const token = await issueToken(user.id, "EMAIL_VERIFICATION");
  await sendVerificationEmail(email, token, name);
  logger.info("User signed up", { userId: user.id });

  return done;
}

async function resendVerification(email: string) {
  if (!emailLimiter(`verify:${email}`).allowed) return;
  const user = await db.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return;
  const token = await issueToken(user.id, "EMAIL_VERIFICATION");
  await sendVerificationEmail(email, token, user.name);
}

/** Verifies an email address from the link in the verification email. */
export async function verifyEmail(token: string): Promise<ActionResult> {
  const userId = await consumeToken(token, "EMAIL_VERIFICATION");
  if (!userId) {
    return {
      ok: false,
      error: "This verification link is invalid or has expired.",
    };
  }
  await db.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  return { ok: true, message: "Your email is verified. You can now sign in." };
}

export async function forgotPasswordAction(
  values: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);
  const { email } = parsed.data;

  if (!emailLimiter(`reset:${await clientIp()}:${email}`).allowed)
    return tooManyRequests;

  const user = await db.user.findUnique({ where: { email } });
  if (user) {
    const token = await issueToken(user.id, "PASSWORD_RESET");
    await sendPasswordResetEmail(email, token, user.name);
  }

  return {
    ok: true,
    message:
      "If an account exists for that email, we've sent a link to reset the password.",
  };
}

export async function resetPasswordAction(
  values: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);

  const userId = await consumeToken(parsed.data.token, "PASSWORD_RESET");
  if (!userId) {
    return {
      ok: false,
      error: "This reset link is invalid or has expired. Request a new one.",
    };
  }

  // Following the emailed link proves the user controls the address.
  await db.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(parsed.data.password),
      emailVerified: new Date(),
    },
  });
  logger.info("Password reset", { userId });

  return {
    ok: true,
    message: "Your password has been reset. You can now sign in.",
  };
}

export async function oauthSignInAction(
  provider: string,
  callbackUrl?: string | null,
) {
  await signIn(provider, {
    redirectTo: safeCallbackUrl(callbackUrl, new URL(env.APP_URL).origin),
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
