import NextAuth, { CredentialsSignin } from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";
import { verifyPassword } from "@/lib/password";
import { signInSchema } from "@/lib/validation/auth";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

class EmailNotVerified extends CredentialsSignin {
  code = "email_not_verified";
}

// OAuth providers are switched on by setting their env vars. Auth.js reads
// AUTH_<PROVIDER>_ID and AUTH_<PROVIDER>_SECRET automatically.
const oauthProviders: Provider[] = [
  ...(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET ? [GitHub] : []),
  ...(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET ? [Google] : []),
];

/** Providers to show as buttons on the sign-in and sign-up pages. */
export const enabledOAuthProviders = oauthProviders.map((provider) => {
  const { id, name } = typeof provider === "function" ? provider() : provider;
  return { id, name };
});

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  logger: {
    error(error) {
      // A wrong password is expected traffic, not a server error.
      if (error instanceof CredentialsSignin) return;
      logger.error(`[auth] ${error.name}: ${error.message}`, {
        cause: String(error.cause ?? ""),
      });
    },
    warn(code) {
      logger.warn(`[auth] ${code}`);
    },
  },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) throw new InvalidCredentials();

        const user = await db.user.findUnique({
          where: { email: parsed.data.email },
        });
        // Compare against a dummy hash when the user is missing so response
        // time doesn't reveal which emails have accounts.
        const valid = await verifyPassword(
          parsed.data.password,
          user?.passwordHash ??
            "$2b$12$K6Ui9jm7FAjLizx6Rs2lbuEAUqAslNB8.M/D/nAEDNaGMspnlmpL2",
        );
        if (!user?.passwordHash || !valid) throw new InvalidCredentials();
        if (!user.emailVerified) throw new EmailNotVerified();

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
    ...oauthProviders,
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      // Refresh profile fields after unstable_update() is called (e.g. from settings).
      if (trigger === "update" && token.sub) {
        const fresh = await db.user.findUnique({ where: { id: token.sub } });
        if (!fresh) return null;
        token.name = fresh.name;
        token.email = fresh.email;
        token.picture = fresh.image;
        token.role = fresh.role;
      }
      return token;
    },
  },
  events: {
    // OAuth providers have already verified the address.
    async linkAccount({ user }) {
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
