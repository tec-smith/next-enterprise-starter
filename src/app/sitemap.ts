import { execFileSync } from "node:child_process";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { absoluteUrl, defaultCard } from "@/lib/metadata";

/**
 * Date of the last commit touching any of the files. Undefined when git
 * history isn't available (e.g. inside the Docker build), and the entry is
 * listed without a date rather than with a wrong one.
 */
function lastCommitDate(files: readonly string[]): Date | undefined {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cI", "--", ...files],
      {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      },
    ).trim();
    return output ? new Date(output) : undefined;
  } catch {
    return undefined;
  }
}

// Public pages from src/config/site.ts, each with its social card, so search
// engines can index the cards in image results too. Add entries for your own
// content (e.g. one per blog post from the database) here.
export default function sitemap(): MetadataRoute.Sitemap {
  return siteConfig.publicPages.map((page) => {
    const lastModified = lastCommitDate(page.sources);
    return {
      url: absoluteUrl(page.path),
      ...(lastModified && { lastModified }),
      changeFrequency: "monthly",
      priority: page.priority,
      images: [absoluteUrl("image" in page ? page.image : defaultCard.url)],
    };
  });
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
