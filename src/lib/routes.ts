/**
 * Route groups used by the proxy and auth callbacks. Kept free of server-only
 * imports so the proxy stays light.
 */

/** Pages for signed-out users; signed-in users are sent to the dashboard. */
export const authRoutes = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
];

/** Path prefixes that need a signed-in user. Everything else is public. */
export const protectedRoutes = ["/dashboard", "/settings", "/admin"];

/** Path prefixes that additionally need the ADMIN role. */
export const adminRoutes = ["/admin"];

export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export function matchesRoute(
  pathname: string,
  routes: readonly string[],
): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Returns the callback URL if it points inside this app, otherwise the
 * default. Prevents open redirects through ?callbackUrl=https://evil.example.
 */
export function safeCallbackUrl(
  callbackUrl: string | null | undefined,
  origin: string,
): string {
  if (!callbackUrl) return DEFAULT_LOGIN_REDIRECT;
  try {
    const url = new URL(callbackUrl, origin);
    if (url.origin !== origin) return DEFAULT_LOGIN_REDIRECT;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_LOGIN_REDIRECT;
  }
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
