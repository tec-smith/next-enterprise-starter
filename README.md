# Next Enterprise Starter

A production-ready Next.js starter with TypeScript, authentication, a PostgreSQL
database and a full testing setup, so you can start on your product instead of
the plumbing.

[![CI](https://github.com/tec-smith/next-enterprise-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/tec-smith/next-enterprise-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

More about this project: [tecsmith.info/portfolio/repositories/next-enterprise-starter](https://www.tecsmith.info/portfolio/repositories/next-enterprise-starter)

## What's included

| Area           | What you get                                                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework      | Next.js 16 (App Router, Turbopack, `proxy.ts`), React 19, TypeScript in strict mode                                                              |
| Authentication | Auth.js v5: email and password, email verification, password reset, optional GitHub and Google sign-in, JWT sessions                             |
| Authorisation  | `USER` and `ADMIN` roles, route protection in the proxy, `requireUser()` and `requireRole()` guards for pages and server actions, an admin page  |
| Database       | PostgreSQL with Prisma 6, versioned migrations, a seed script, and Docker Compose for local Postgres                                             |
| UI             | Tailwind CSS 4, shadcn/ui components, light and dark themes, react-hook-form with Zod validation shared between client and server                |
| Testing        | Vitest with separate Node and jsdom projects, Testing Library, Playwright end-to-end tests, coverage reports                                     |
| Security       | Validated environment, CSP and security headers, rate limiting, hashed single-use email tokens, no account enumeration, open-redirect protection |
| Operations     | Standalone Docker image, `/api/health` endpoint, structured JSON logs in production, GitHub Actions CI, Dependabot                               |
| Email          | SMTP via Nodemailer. In development, emails print to the terminal, or go to the bundled Mailpit inbox                                            |

## Quick start

You need Node.js 20.9 or later (24 recommended, see `.nvmrc`) and Docker for
the local database.

```bash
# 1. Create your copy: click "Use this template" on GitHub, or
git clone https://github.com/tec-smith/next-enterprise-starter.git my-app
cd my-app

# 2. Install dependencies (also generates the Prisma client)
npm install

# 3. Configure the environment
cp .env.example .env
npx auth secret            # writes AUTH_SECRET to .env.local; or set it in .env yourself

# 4. Start Postgres and Mailpit, then create and seed the database
docker compose up -d
npm run db:migrate
npm run db:seed

# 5. Run the app
npm run dev
```

Open [localhost:3000](http://localhost:3000) and sign in with a seeded account:

| Email               | Password       | Role  |
| ------------------- | -------------- | ----- |
| `admin@example.com` | `Password123!` | ADMIN |
| `user@example.com`  | `Password123!` | USER  |

> **No Docker?** Run `npx prisma dev` for a local Prisma Postgres server and
> put the `postgres://` URL it prints into `DATABASE_URL`, adding
> `&connection_limit=1&pgbouncer=true` (it serves one connection and doesn't
> keep prepared statements apart between them). Or point `DATABASE_URL` at
> any PostgreSQL database.

### Email during development

With `SMTP_HOST` empty, emails, including verification and reset links, are
printed to the terminal running `npm run dev`. To see them as real emails, use
the Mailpit container that `docker compose up` started: set `SMTP_HOST=localhost`
and `SMTP_PORT=1025` in `.env`, and open [localhost:8025](http://localhost:8025).

## Scripts

| Command              | What it does                                                         |
| -------------------- | -------------------------------------------------------------------- |
| `npm run dev`        | Start the development server                                         |
| `npm run build`      | Create a production build                                            |
| `npm run start`      | Serve the production build                                           |
| `npm run validate`   | Lint, typecheck and run unit tests: run before you push              |
| `npm run lint`       | ESLint, failing on any warning (`lint:fix` to autofix)               |
| `npm run typecheck`  | Generate route types and run the TypeScript compiler                 |
| `npm run format`     | Format everything with Prettier (`format:check` to verify)           |
| `npm test`           | Unit and component tests (`test:watch`, `test:coverage`)             |
| `npm run test:e2e`   | Playwright end-to-end tests (`test:e2e:ui` for the interactive mode) |
| `npm run db:migrate` | Create and apply a migration after editing the schema                |
| `npm run db:deploy`  | Apply pending migrations (production and CI)                         |
| `npm run db:seed`    | Seed development users                                               |
| `npm run db:reset`   | Drop, re-migrate and re-seed the local database                      |
| `npm run db:studio`  | Browse the database in Prisma Studio                                 |

## Project structure

```text
├── prisma/
│   ├── schema.prisma          # Data model: User, Account, AuthToken
│   ├── migrations/            # Versioned SQL migrations
│   └── seed.ts                # Development users
├── src/
│   ├── app/
│   │   ├── (auth)/            # Sign in, sign up, forgot/reset password, verify email
│   │   ├── (app)/             # Signed-in area: dashboard, settings, admin
│   │   ├── api/auth/          # Auth.js route handler
│   │   ├── api/health/        # Health check for load balancers
│   │   └── page.tsx           # Public landing page
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── auth/              # Auth forms and OAuth buttons
│   │   ├── settings/          # Profile and password forms
│   │   └── layout/            # Header, footer, user menu, theme toggle
│   ├── config/site.ts         # App name, description, navigation
│   ├── hooks/                 # Client hooks (server-action form handling)
│   ├── lib/
│   │   ├── actions/           # Server actions
│   │   ├── auth/              # Auth.js config, session guards
│   │   ├── mail/              # SMTP sender and email templates
│   │   ├── validation/        # Zod schemas shared by forms and actions
│   │   ├── db.ts              # Prisma client
│   │   ├── env.ts             # Validated environment variables
│   │   ├── logger.ts          # Structured logger
│   │   ├── rate-limit.ts      # Rate limiter
│   │   ├── routes.ts          # Public, auth, protected and admin routes
│   │   └── tokens.ts          # Email verification and reset tokens
│   └── proxy.ts               # Runs before requests: route protection
├── tests/e2e/                 # Playwright tests
└── .github/                   # CI workflow, Dependabot, PR template
```

## How authentication works

- **Sessions** are JWTs in an HTTP-only cookie, so the proxy can check them
  without a database call. The token carries the user's ID and role.
- **The proxy** (`src/proxy.ts`) uses the lightweight config in
  `src/lib/auth/config.ts`. Its `authorized` callback sends signed-out visitors
  on protected routes to `/sign-in?callbackUrl=…`, keeps non-admins out of
  `/admin`, and moves signed-in users off the auth pages.
- **The proxy isn't the security boundary.** Every protected page and server
  action also calls `requireUser()` or `requireRole()` from
  `src/lib/auth/session.ts`.
- **Email and password sign-up** hashes the password with bcrypt and emails a
  verification link. Users can't sign in until they verify; trying again sends
  a fresh link.
- **Tokens** for verification and password reset are 32 random bytes. Only
  their SHA-256 hash is stored, they expire (24 hours and 1 hour), and they
  work once.
- **OAuth** providers turn on when their environment variables are set. Users
  who sign in with a provider are marked verified. Auth.js refuses to link a
  provider to an existing account with the same email, which prevents account
  takeover through a provider that doesn't verify emails.
- **Role changes** take effect at the user's next sign-in, because the role
  lives in the session token. Call `unstable_update()` for changes that must
  apply immediately (the settings page does this for name changes).

### Adding an OAuth provider

1. Create an OAuth app with the provider and set its callback URL to
   `<APP_URL>/api/auth/callback/<provider>`.
2. Add `AUTH_<PROVIDER>_ID` and `AUTH_<PROVIDER>_SECRET` to `.env`.
3. GitHub and Google are already wired up. For another
   [Auth.js provider](https://authjs.dev/getting-started/providers), add it to
   `oauthProviders` in `src/lib/auth/index.ts` and its keys to `src/lib/env.ts`.

## Building on the template

**Rebrand.** Change the name, description and links in `src/config/site.ts`,
the colour tokens at the top of `src/app/globals.css`, and the icon in
`src/app/icon.svg`.

**Add a data model.** Edit `prisma/schema.prisma`, then run
`npm run db:migrate -- --name add_projects`. Commit the generated migration.

**Add a protected page.** Create it under `src/app/(app)/`, so the layout
checks for a user, and add its path prefix to `protectedRoutes` in
`src/lib/routes.ts`. Add it to `adminRoutes` too if only admins should see it,
and call `requireRole("ADMIN")` in the page.

**Add a server action.** Put a Zod schema in `src/lib/validation`, write the
action in `src/lib/actions` returning an `ActionResult`, and check the user
inside it. In a client form, `useActionForm` (in `src/hooks`) runs the action
and maps field errors back onto react-hook-form.

**Add UI components.** The project is configured for the shadcn CLI:
`npx shadcn@latest add dialog`.

## SEO and social sharing

- **Metadata.** Public pages build their tags with `pageMetadata()` from
  `src/lib/metadata.ts`: title, description, canonical URL, and Open Graph and
  Twitter tags with a 1200×630 social card. Signed-in pages and token links
  are marked `noindex`.
- **Social cards** are rendered with `next/og` by `renderCard()` in
  `src/lib/og-card.tsx`. The site-wide card is `src/app/opengraph-image.tsx`.
  For a page's own card, add a route under `src/app/cards/` and pass its URL
  as `image` to `pageMetadata()`; `src/app/cards/sign-up` is an example.
- **`/sitemap.xml`** lists the public pages in `siteConfig.publicPages`, each
  with its social card, dated by the last git commit to the files it's built
  from. Add your own content (blog posts, products) in `src/app/sitemap.ts`.
- **`/robots.txt`** allows public pages, keeps private areas out and points
  at the sitemap.
- **`/llms.txt`** gives language models a plain-text overview of the site
  ([llmstxt.org](https://llmstxt.org)), built from the same config.

These are rendered at build time, so set `APP_URL` before building. For Docker,
pass it as a build argument: `docker build --build-arg APP_URL=https://example.com .`

## Testing

```bash
npm test             # unit and component tests
npm run test:coverage
npm run test:e2e     # needs a migrated, seeded database
```

- **Unit tests** (`*.test.ts`) run in Node: validation, rate limiting, tokens,
  routing rules, email templates and server actions with a mocked database.
- **Component tests** (`*.test.tsx`) run in jsdom with Testing Library.
- **End-to-end tests** (`tests/e2e/`) drive Chromium against a real server and
  database: sign-in, protected and admin routes, sign-up, settings, security
  headers and the health check. Locally, Playwright starts `npm run dev` for
  you, or reuses a server already running on port 3000. Run
  `npx playwright install chromium` once first.

CI runs everything on each push and pull request: formatting, lint,
typecheck and unit tests in one job, then a production build and the
end-to-end suite against a Postgres service container.

## Environment variables

All variables are validated at startup by `src/lib/env.ts`; the app won't
start with a missing or malformed value. See `.env.example` for the full list.

| Variable                                               | Required         | Purpose                                      |
| ------------------------------------------------------ | ---------------- | -------------------------------------------- |
| `DATABASE_URL`                                         | Yes              | PostgreSQL connection string                 |
| `AUTH_SECRET`                                          | In production    | Signs session tokens; at least 32 characters |
| `APP_URL`                                              | In production    | Public base URL, used in email links         |
| `AUTH_TRUST_HOST`                                      | When self-hosted | Trust the `Host` header behind your proxy    |
| `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`                 | No               | Enables GitHub sign-in                       |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`                 | No               | Enables Google sign-in                       |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | In production    | Outgoing email                               |
| `MAIL_FROM`                                            | No               | Sender address for outgoing email            |
| `LOG_LEVEL`                                            | No               | `debug`, `info` (default), `warn` or `error` |

## Deployment

### Vercel

1. Import the repository in Vercel.
2. Add the environment variables above. Use a managed Postgres such as
   Neon or Supabase for `DATABASE_URL`.
3. Set the build command to `npm run db:deploy && npm run build`, so
   migrations run before each deploy.

### Docker

The `Dockerfile` builds a small image that runs Next.js's standalone server as
a non-root user, with a health check on `/api/health`.

```bash
# The whole stack locally: Postgres, Mailpit, migrations, then the app
docker compose --profile app up --build

# Or build and run the image yourself
docker build -t my-app .
docker run -p 3000:3000 --env-file .env my-app
```

Run `npx prisma migrate deploy` against the database before starting a new
version. The Compose `migrate` service shows one way to do this.

### Before going to production

- Generate a fresh `AUTH_SECRET` per environment and keep it out of the repo.
- Configure SMTP. Without it, production sign-ups can't verify their email.
- Set `APP_URL` to your public URL, at build time as well as at runtime: the
  social cards, sitemap and llms.txt are prerendered with it.
- Replace the in-memory rate limiter with a shared store (Redis or Upstash)
  if you run more than one instance. The interface is in
  `src/lib/rate-limit.ts`.
- Add the origins of any third-party scripts, images or APIs to the
  Content-Security-Policy in `next.config.ts`.
- Don't run the seed against production. It refuses unless `SEED_FORCE=1` is set.

## Security

What the template does by default:

- Passwords hashed with bcrypt (cost 12); sign-in compares against a dummy
  hash for unknown emails so response time doesn't reveal which accounts exist.
- Sign-up and password reset give the same response whether or not an
  account exists.
- Rate limits on sign-in, sign-up and email-sending actions.
- Single-use, expiring, hashed tokens for email links. Changing your password
  revokes outstanding reset links.
- `callbackUrl` redirects are restricted to the app's own origin.
- Content-Security-Policy, HSTS, `X-Content-Type-Options`, `Referrer-Policy`
  and `Permissions-Policy` headers on every response; no `X-Powered-By`.
- Server-only modules are marked with `server-only`, so importing them into a
  client component fails the build.

Found a vulnerability? See [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

Are you using this project as part of your own solution? [Buy me a cup of coffee to keep me tapping away...](https://www.buymeacoffee.com/tecsmith)

This took me, [Thomas EC. Smith](https://linktr.ee/tecsmith), time and effort to put together. If you're feeling particularly generous, a financial contribution of any amount would be greatly appreciated, and thank you for your consideration!

<table align="center" width="100%" style="border-collapse: collapse;">
  <tr>
    <td align="center" width="33%" style="border: none;"><b>PayPal</b></td>
    <td align="center" width="33%" style="border: none;"><b>Wise</b></td>
    <td align="center" width="34%" style="border: none;"><b>Revolut</b></td>
  </tr>
  <tr>
    <td align="center" style="border: none;"><img src="https://tecsmith.info/assets/image/codes/paypal.webp" alt="PayPal" width="100" height="100"></td>
    <td align="center" style="border: none;"><img src="https://tecsmith.info/assets/image/codes/wise.webp" alt="Wise" width="100" height="100"></td>
    <td align="center" style="border: none;"><img src="https://tecsmith.info/assets/image/codes/revolut.webp" alt="Revolut" width="100" height="100"></td>
  </tr>
</table>

For all enquiries, [please visit my website](https://www.tecsmith.info).

## License

[MIT](LICENSE) 2026 © Thomas EC. Smith
