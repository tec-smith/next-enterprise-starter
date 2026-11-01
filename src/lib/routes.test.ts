import {
  DEFAULT_LOGIN_REDIRECT,
  matchesRoute,
  safeCallbackUrl,
} from "@/lib/routes";

describe("matchesRoute", () => {
  it("matches exact paths and sub-paths", () => {
    expect(matchesRoute("/dashboard", ["/dashboard"])).toBe(true);
    expect(matchesRoute("/dashboard/reports", ["/dashboard"])).toBe(true);
  });

  it("does not match paths that only share a prefix", () => {
    expect(matchesRoute("/dashboards", ["/dashboard"])).toBe(false);
  });
});

describe("safeCallbackUrl", () => {
  const origin = "http://localhost:3000";

  it("keeps same-origin paths, including query and hash", () => {
    expect(safeCallbackUrl("/settings?tab=profile#name", origin)).toBe(
      "/settings?tab=profile#name",
    );
    expect(safeCallbackUrl("http://localhost:3000/admin", origin)).toBe(
      "/admin",
    );
  });

  it.each([
    "https://evil.example/phish",
    "//evil.example",
    "javascript:alert(1)",
  ])("rejects off-site target %s", (target) => {
    expect(safeCallbackUrl(target, origin)).toBe(DEFAULT_LOGIN_REDIRECT);
  });

  it("falls back to the default when empty", () => {
    expect(safeCallbackUrl(undefined, origin)).toBe(DEFAULT_LOGIN_REDIRECT);
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
