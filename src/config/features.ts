import {
  Database,
  FlaskConical,
  KeyRound,
  Lock,
  Rocket,
  ShieldCheck,
} from "lucide-react";

/** What the starter includes: shown on the home page and listed in llms.txt. */
export const features = [
  {
    icon: KeyRound,
    title: "Authentication",
    description:
      "Auth.js with email and password, verification, password reset and optional GitHub and Google sign-in.",
  },
  {
    icon: Lock,
    title: "Role-based access",
    description:
      "Route protection in the proxy, server-side guards for pages and actions, and an admin area.",
  },
  {
    icon: Database,
    title: "PostgreSQL with Prisma",
    description:
      "Typed queries, versioned migrations, a seed script and a Docker Compose database for local work.",
  },
  {
    icon: FlaskConical,
    title: "Testing",
    description:
      "Vitest and Testing Library for units and components, Playwright for end-to-end flows, all in CI.",
  },
  {
    icon: ShieldCheck,
    title: "Secure defaults",
    description:
      "Validated environment, security headers, rate limiting, hashed single-use tokens and no account enumeration.",
  },
  {
    icon: Rocket,
    title: "Ready to ship",
    description:
      "Standalone Docker image, health check endpoint, structured logging, social cards, sitemap and llms.txt.",
  },
];

/***
  @COPYRIGHT (c) 2026. Thomas EC. Smith (https://www.TECSmith.info). Licensed under the MIT License.
****/
