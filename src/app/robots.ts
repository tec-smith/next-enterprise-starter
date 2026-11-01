import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

// Generated rather than a static public/robots.txt, so the sitemap URL
// follows APP_URL.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/settings",
        "/admin",
        "/api/",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
