import type { Session } from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth/config";

type AuthorizedParams = Parameters<typeof authConfig.callbacks.authorized>[0];

function check(pathname: string, user?: Partial<Session["user"]>) {
  const request = {
    nextUrl: new URL(pathname, "http://localhost:3000"),
  } as NextRequest;
  const auth = user ? ({ user, expires: "" } as Session) : null;
  return authConfig.callbacks.authorized({ auth, request } as AuthorizedParams);
}

function redirectTarget(result: unknown) {
  expect(result).toBeInstanceOf(Response);
  return new URL((result as Response).headers.get("location")!).pathname;
}

describe("authorized callback", () => {
  it("lets anyone view public pages", () => {
    expect(check("/")).toBe(true);
  });

  it("sends signed-out visitors on protected pages to sign-in", () => {
    expect(check("/dashboard")).toBe(false);
    expect(check("/settings/security")).toBe(false);
  });

  it("lets signed-in users view protected pages", () => {
    expect(check("/dashboard", { id: "1", role: "USER" })).toBe(true);
  });

  it("redirects signed-in users away from auth pages", () => {
    expect(redirectTarget(check("/sign-in", { id: "1", role: "USER" }))).toBe(
      "/dashboard",
    );
  });

  it("keeps non-admins out of the admin area", () => {
    expect(redirectTarget(check("/admin", { id: "1", role: "USER" }))).toBe(
      "/dashboard",
    );
    expect(check("/admin", { id: "1", role: "ADMIN" })).toBe(true);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
