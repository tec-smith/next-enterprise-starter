import "server-only";
import { forbidden, redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";

/** Returns the signed-in user, or redirects to sign-in. For pages and actions. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  return session.user;
}

/** Returns the signed-in user if they have the role, otherwise renders 403. */
export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) forbidden();
  return user;
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
