/**
 * Fixed-window rate limiter held in server memory.
 *
 * State is per server instance, so this blunts bursts from a single client
 * but is not a global guarantee. When you run more than one instance, back
 * this interface with a shared store such as Redis or Upstash.
 */
interface RateLimitWindow {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  limit: number;
  windowMs: number;
  // Bounds memory use if a flood arrives from many distinct keys.
  maxKeys?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
}: RateLimiterOptions) {
  const windows = new Map<string, RateLimitWindow>();

  const pruneExpired = (now: number) => {
    for (const [key, window] of windows) {
      if (window.resetAt <= now) windows.delete(key);
    }
  };

  /** Records a hit for the key and reports whether it is within the limit. */
  return function consume(key: string): RateLimitResult {
    const now = Date.now();
    const current = windows.get(key);

    if (!current || current.resetAt <= now) {
      if (windows.size >= maxKeys) {
        pruneExpired(now);
        // Still full of live windows: fail closed rather than grow unbounded.
        if (windows.size >= maxKeys)
          return { allowed: false, retryAfterMs: windowMs };
      }
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, retryAfterMs: 0 };
    }

    if (current.count >= limit) {
      return { allowed: false, retryAfterMs: current.resetAt - now };
    }

    current.count += 1;
    return { allowed: true, retryAfterMs: 0 };
  };
}

/**
 * Reads the client address set by the hosting proxy, for use as a limiter key.
 * Only trust these headers when the app sits behind a proxy that sets them.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
