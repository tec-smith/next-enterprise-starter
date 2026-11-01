# Contributing

Thanks for helping improve the starter. Bug reports, fixes and focused
improvements are all welcome.

## Getting set up

Follow the [quick start](README.md#quick-start) to get the app running with a
local database, then check everything passes:

```bash
npm run validate   # lint, typecheck, unit tests
npm run test:e2e   # end-to-end tests (needs the seeded database)
```

## Making a change

1. Open an issue first for anything larger than a small fix, so we can agree
   on the approach before you put time in.
2. Branch from `main` and keep the change focused on one thing.
3. Add or update tests for behaviour you change.
4. Run `npm run format` and `npm run validate` before pushing.
5. Open a pull request describing what changed and how you tested it.

## Guidelines

- The template should stay small. Prefer a clear extension point and a note in
  the README over adding another dependency.
- Follow the conventions in [AGENTS.md](AGENTS.md); they apply to people too.
- Don't commit secrets. `.env` is git-ignored; document new variables in
  `.env.example` and `src/lib/env.ts`.
