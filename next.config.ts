import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Static Content-Security-Policy, sent as a header so pages stay prerendered.
// 'unsafe-inline' scripts are needed for Next.js's inline hydration data
// without a per-request nonce. Add origins here as you add third parties.
// See https://nextjs.org/docs/app/guides/content-security-policy for nonces.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Self-contained server bundle, used by the Docker image. `next start`
  // doesn't serve standalone builds, so only the Dockerfile turns this on.
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  experimental: {
    // Enables forbidden() and unauthorized() from next/navigation.
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  headers: async () => [{ source: "/(.*)", headers: securityHeaders }],
};

export default nextConfig;

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
