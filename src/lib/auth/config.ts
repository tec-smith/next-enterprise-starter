import type { NextAuthConfig } from "next-auth";
import {
  adminRoutes,
  authRoutes,
  DEFAULT_LOGIN_REDIRECT,
  matchesRoute,
  protectedRoutes,
} from "@/lib/routes";

/**
 * Base Auth.js configuration shared by the proxy and the full server setup.
 * It must not import Prisma, bcrypt or other heavy server modules: the proxy
 * runs on every request and only needs to read the session cookie.
 */
export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [],
  callbacks: {
    // Runs in the proxy to decide whether a request may continue.
    authorized({ auth, request: { nextUrl } }) {
      const user = auth?.user;
      const { pathname } = nextUrl;

      if (matchesRoute(pathname, authRoutes)) {
        return user
          ? Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
          : true;
      }

      if (matchesRoute(pathname, protectedRoutes)) {
        if (!user) return false; // Auth.js redirects to pages.signIn with a callbackUrl.
        if (matchesRoute(pathname, adminRoutes) && user.role !== "ADMIN") {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
