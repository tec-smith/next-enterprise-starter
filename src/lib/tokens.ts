import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { type AuthTokenType } from "@prisma/client";
import { db } from "@/lib/db";

export const TOKEN_TTL_MS: Record<AuthTokenType, number> = {
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000,
  PASSWORD_RESET: 60 * 60 * 1000,
};

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issues a single-use token, replacing any earlier one of the same type for
 * the user. Returns the raw token for the email link; only its hash is stored.
 */
export async function issueToken(
  userId: string,
  type: AuthTokenType,
): Promise<string> {
  const token = randomBytes(32).toString("base64url");

  await db.$transaction([
    db.authToken.deleteMany({ where: { userId, type } }),
    db.authToken.create({
      data: {
        userId,
        type,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + TOKEN_TTL_MS[type]),
      },
    }),
  ]);

  return token;
}

/**
 * Consumes the token and returns its user ID if it was valid. The delete is
 * conditional on the row still existing, so two racing requests can't both
 * use the same token.
 */
export async function consumeToken(
  token: string,
  type: AuthTokenType,
): Promise<string | null> {
  const record = await db.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.type !== type) return null;

  const { count } = await db.authToken.deleteMany({ where: { id: record.id } });
  if (count === 0 || record.expiresAt < new Date()) return null;
  return record.userId;
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
