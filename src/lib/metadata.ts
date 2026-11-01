import "server-only";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";

/** Every social card is a 1200×630 PNG (src/lib/og-card.tsx). */
export const CARD_SIZE = { width: 1200, height: 630 };

/** The site-wide social card, rendered by src/app/opengraph-image.tsx. */
export const defaultCard = {
  url: "/opengraph-image",
  alt: `${siteConfig.name}: ${siteConfig.tagline}`,
};

/** A path on this site as a full URL, for the sitemap, llms.txt and feeds. */
export function absoluteUrl(path: string): string {
  return new URL(path, env.APP_URL).toString();
}

// Search results show about 160 characters of a description.
export const DESCRIPTION_LENGTH = 160;

/** Shortens text to `max` characters at a word boundary, ending in "…". */
export function clipDescription(
  text: string,
  max = DESCRIPTION_LENGTH,
): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:—–-]+$/, "")}…`;
}

interface PageMetadataOptions {
  /** Shown before the site name; leave out for the home page. */
  title?: string;
  description: string;
  path: string;
  /** The page's own social card, e.g. a route under src/app/cards. */
  image?: { url: string; alt: string };
  /** Keep the page out of search results (it stays reachable). */
  noIndex?: boolean;
}

/**
 * Full metadata for a public page: title, description, canonical URL, and
 * the Open Graph and Twitter tags with a social card.
 *
 * Next.js replaces, rather than merges, `openGraph` and `twitter` from
 * parent layouts, so each page sets the whole set through this helper. An
 * image named here also wins over a route's own opengraph-image file, so a
 * page with its own card passes it as `image`.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex,
}: PageMetadataOptions): Metadata {
  const fullTitle = title
    ? `${title} · ${siteConfig.name}`
    : `${siteConfig.name}: ${siteConfig.tagline}`;
  const summary = clipDescription(description);
  const images = [
    { ...(image ?? defaultCard), ...CARD_SIZE, type: "image/png" },
  ];

  return {
    title: { absolute: fullTitle },
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: path,
      siteName: siteConfig.name,
      title: fullTitle,
      description: summary,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: summary,
      images,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
