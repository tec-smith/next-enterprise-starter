import { siteConfig } from "@/config/site";
import { defaultCard } from "@/lib/metadata";
import { cardSize, cardType, renderCard } from "@/lib/og-card";

// The site-wide social card, used by every page without its own. Rendered at
// build time; set APP_URL before building so the card shows your domain.
export const alt = defaultCard.alt;
export const size = cardSize;
export const contentType = cardType;

export default function Image() {
  return renderCard({
    title: siteConfig.tagline,
    description: siteConfig.description,
    tags: ["Next.js 16", "Auth.js", "Prisma", "PostgreSQL", "Playwright"],
  });
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
