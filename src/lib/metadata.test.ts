import { siteConfig } from "@/config/site";
import {
  absoluteUrl,
  clipDescription,
  DESCRIPTION_LENGTH,
  pageMetadata,
} from "@/lib/metadata";

describe("clipDescription", () => {
  it("keeps a description that fits, tidying its spaces", () => {
    expect(clipDescription("  Build   faster\nwith this. ")).toBe(
      "Build faster with this.",
    );
  });

  it("cuts a long one at the last whole word, with an ellipsis", () => {
    const long = `${"Authentication, testing and deployment, ".repeat(6)}the end.`;
    const clipped = clipDescription(long);
    expect(clipped.length).toBeLessThanOrEqual(DESCRIPTION_LENGTH);
    expect(clipped).toMatch(/[a-z]…$/);
    expect(long.startsWith(clipped.slice(0, -1))).toBe(true);
  });

  it("cuts one long word where it has to", () => {
    expect(clipDescription("x".repeat(200), 10)).toBe(`${"x".repeat(9)}…`);
  });
});

describe("absoluteUrl", () => {
  it("resolves paths against APP_URL", () => {
    expect(absoluteUrl("/sitemap.xml")).toBe(
      "http://localhost:3000/sitemap.xml",
    );
  });
});

describe("pageMetadata", () => {
  it("sets the title, canonical URL and the site card for Open Graph and Twitter", () => {
    const metadata = pageMetadata({
      title: "Pricing",
      description: "Plans.",
      path: "/pricing",
    });

    expect(metadata.title).toEqual({
      absolute: `Pricing · ${siteConfig.name}`,
    });
    expect(metadata.alternates?.canonical).toBe("/pricing");
    expect(metadata.openGraph).toMatchObject({
      url: "/pricing",
      images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.robots).toBeUndefined();
  });

  it("uses a page's own card and can keep it out of search results", () => {
    const metadata = pageMetadata({
      description: "Home.",
      path: "/",
      image: { url: "/custom/opengraph-image", alt: "Custom" },
      noIndex: true,
    });

    expect(metadata.title).toEqual({
      absolute: `${siteConfig.name}: ${siteConfig.tagline}`,
    });
    expect(metadata.openGraph).toMatchObject({
      images: [{ url: "/custom/opengraph-image", alt: "Custom" }],
    });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
