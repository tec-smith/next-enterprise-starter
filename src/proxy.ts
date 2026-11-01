import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

/**
 * Runs before matching requests. Uses the lightweight auth config, which
 * reads the session cookie without touching the database; route rules live
 * in the `authorized` callback in src/lib/auth/config.ts.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Skip Next.js internals, static files and the auth API itself.
  matcher: ["/((?!api/auth|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
