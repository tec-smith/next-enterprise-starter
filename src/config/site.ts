/** Branding, navigation and public pages. Change these first when starting a new project. */
export const siteConfig = {
  name: "Next Enterprise Starter",
  tagline: "Start from a production-ready base",
  description:
    "A production-ready Next.js starter with authentication, a PostgreSQL database and a full testing setup.",
  locale: "en_US",
  repositoryUrl: "https://github.com/tec-smith/next-enterprise-starter",
  nav: {
    app: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/settings", label: "Settings" },
    ],
  },
  /**
   * Pages anyone can visit, listed in the sitemap and llms.txt. `sources` are
   * the files each is built from: the sitemap dates the page by their last
   * commit. `image` is the page's own social card, if it has one.
   */
  publicPages: [
    {
      path: "/",
      title: "Home",
      description: "What the starter includes and how to get going.",
      sources: ["src/app/page.tsx", "src/config"],
      priority: 1,
    },
    {
      path: "/sign-up",
      title: "Create an account",
      description:
        "Register with email and password, or a social provider when one is configured.",
      sources: ["src/app/(auth)/sign-up", "src/components/auth"],
      image: "/cards/sign-up",
      priority: 0.6,
    },
    {
      path: "/sign-in",
      title: "Sign in",
      description: "Sign in to the dashboard.",
      sources: ["src/app/(auth)/sign-in", "src/components/auth"],
      priority: 0.5,
    },
  ],
} as const;

export type PublicPage = (typeof siteConfig.publicPages)[number];

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
