"use server";

import { revalidatePath } from "next/cache";
import { unstable_update } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { hashPassword, verifyPassword } from "@/lib/password";
import { invalid, type ActionResult } from "@/lib/actions/result";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordInput,
  type ProfileInput,
} from "@/lib/validation/account";

export async function updateProfileAction(
  values: ProfileInput,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);

  await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name },
  });
  // Re-issue the session cookie so the new name shows without signing out.
  await unstable_update({});
  revalidatePath("/", "layout");

  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(
  values: ChangePasswordInput,
): Promise<ActionResult> {
  const sessionUser = await requireUser();
  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) return invalid(parsed.error);

  const user = await db.user.findUnique({ where: { id: sessionUser.id } });
  if (!user?.passwordHash) {
    return {
      ok: false,
      error:
        "Your account uses social sign-in. Use “Forgot password” to add a password.",
    };
  }

  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: { currentPassword: ["Your current password is incorrect."] },
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  // Outstanding reset links should no longer work once the password changes.
  await db.authToken.deleteMany({
    where: { userId: user.id, type: "PASSWORD_RESET" },
  });
  logger.info("Password changed", { userId: user.id });

  return { ok: true, message: "Password changed." };
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
