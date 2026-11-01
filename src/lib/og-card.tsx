import "server-only";
import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { env } from "@/lib/env";
import { CARD_SIZE } from "@/lib/metadata";

/**
 * The link-preview card shown when a page is shared on social networks and
 * in chat apps. Rendered by next/og (Satori): plain flexbox and inline
 * styles only, and every element with more than one child needs
 * `display: flex`. Uses next/og's bundled Geist font, so no font files are
 * needed; pass `fonts` to ImageResponse to use your own.
 *
 * The site-wide card is src/app/opengraph-image.tsx. For a page's own card,
 * add a route under src/app/cards and name it in the page's pageMetadata()
 * (see src/app/cards/sign-up and the sign-up page).
 */
export const cardSize = CARD_SIZE;
export const cardType = "image/png";

const colors = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a3a3a3",
  border: "#262626",
  accent: "#fafafa",
};

interface CardOptions {
  /** A short label above the title, e.g. the section name. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Short labels along the bottom, e.g. technologies or facts. */
  tags?: string[];
}

function Logo() {
  return (
    <svg width="44" height="44" viewBox="0 0 32 32">
      <rect width="32" height="32" rx="8" fill={colors.foreground} />
      <path
        d="M9 11.5 16 8l7 3.5v9L16 24l-7-3.5zM9 11.5 16 15l7-3.5M16 15v9"
        fill="none"
        stroke={colors.background}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function renderCard({
  eyebrow,
  title,
  description,
  tags = [],
}: CardOptions) {
  const domain = new URL(env.APP_URL).host.replace(/^www\./, "");
  // Long titles step down so they stay on the card.
  const titleSize = title.length > 48 ? 56 : title.length > 28 ? 68 : 84;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: colors.background,
        backgroundImage:
          "radial-gradient(circle at 85% 0%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%)",
        color: colors.foreground,
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30 }}
      >
        <Logo />
        {siteConfig.name}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 980,
        }}
      >
        {eyebrow && (
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: "0.12em",
              color: colors.muted,
            }}
          >
            {eyebrow.toUpperCase()}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: "flex",
              fontSize: 30,
              lineHeight: 1.35,
              color: colors.muted,
            }}
          >
            {description}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          {tags.slice(0, 5).map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "8px 18px",
                border: `1px solid ${colors.border}`,
                borderRadius: 999,
                fontSize: 22,
                color: colors.muted,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: colors.muted }}>
          {domain}
        </div>
      </div>
    </div>,
    cardSize,
  );
}

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
