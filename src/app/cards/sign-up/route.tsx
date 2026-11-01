import { renderCard } from "@/lib/og-card";

// An example of a page with its own social card, served at a fixed URL that
// the sign-up page names in its metadata (pageMetadata's `image`) and the
// sitemap lists. Add a folder here for each page that should have its own.
// (An opengraph-image.tsx inside a route group gets a hashed URL, which
// metadata can't name in advance.) Rendered at build time.
export const dynamic = "force-static";

export function GET() {
  return renderCard({
    eyebrow: "Get started",
    title: "Create your account",
    description:
      "Sign up with email and password, or continue with GitHub or Google.",
  });
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
