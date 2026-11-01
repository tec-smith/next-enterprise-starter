import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit within a window", () => {
    const consume = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(consume("a").allowed).toBe(true);
    expect(consume("a").allowed).toBe(true);
    expect(consume("a")).toEqual({ allowed: false, retryAfterMs: 1000 });
  });

  it("tracks keys independently", () => {
    const consume = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(consume("a").allowed).toBe(true);
    expect(consume("b").allowed).toBe(true);
    expect(consume("a").allowed).toBe(false);
  });

  it("resets after the window passes", () => {
    const consume = createRateLimiter({ limit: 1, windowMs: 1000 });
    consume("a");
    vi.advanceTimersByTime(1001);
    expect(consume("a").allowed).toBe(true);
  });

  it("fails closed when the key table is full of live windows", () => {
    const consume = createRateLimiter({ limit: 5, windowMs: 1000, maxKeys: 2 });
    consume("a");
    consume("b");
    expect(consume("c").allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(consume("c").allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for address", () => {
    expect(
      getClientIp(new Headers({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" })),
    ).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.2" }))).toBe(
      "203.0.113.2",
    );
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
