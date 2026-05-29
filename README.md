# GameFinder

GameFinder is a public AI workflow testbed disguised as a realistic **video game** discovery product. It helps users find, rank, and evaluate games by age suitability, difficulty, genre, platform, play style, content intensity, and community suggestions.

## Why This Project Exists

Most AI tool comparisons use toy examples. GameFinder provides a repeatable monorepo benchmark with shared types, PostgreSQL, Drizzle, RBAC, moderation workflows, web + mobile clients, and deterministic seed data.

## Current Status

**Phase 2 — video game vertical slice**

Implemented:

- Video game schema + 20-game seed catalog
- Demo local auth (not production-ready)
- RBAC with shared permission helpers
- Web staff portal for moderation and admin
- Mobile user app with read-only catalog, search, and detail
- Unit + API integration tests
- Root Vitest smoke test and Playwright web smoke tests

## Quick Start

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:reset
pnpm dev
```

- Web: http://localhost:5173 (moderator + admin)
- Mobile: Expo dev server from `pnpm dev` (user + contributor)
- API: http://localhost:3001
- Postgres: localhost:5433

### Demo users (testbed auth only)

| Email | Password | Role | Client |
|-------|----------|------|--------|
| admin@gametest.local | admin123 | admin | Web |
| moderator@gametest.local | mod123 | moderator | Web |
| user@gametest.local | user123 | user | Mobile |
| contributor@gametest.local | contrib123 | contributor | Mobile |

**Warning:** Demo credentials and session auth are for local testbed use only. Do not deploy this auth model to production.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages/apps |
| `pnpm test` | Run package unit/integration tests plus root Vitest smoke test |
| `pnpm test:unit` | Same as `pnpm test` |
| `pnpm test:e2e` | Run Playwright smoke tests against the web staff portal |
| `pnpm test:e2e:install` | Install Playwright Chromium browser (first-time setup) |
| `pnpm db:reset` | Wipe Postgres volume and reseed |
| `pnpm db:seed` | Reseed existing database |

## Testing

GameFinder uses a layered test setup:

| Layer | Tool | Location | What it covers |
|-------|------|----------|----------------|
| Shared/API unit + integration | Vitest | `packages/shared`, `apps/api` | Schemas, RBAC, API routes |
| Project smoke | Vitest | `tests/smoke.test.ts` | Shared exports and client-role wiring |
| Web smoke / staff flows | Playwright | `e2e/smoke.spec.ts` | Staff login UI and moderator sign-in |

Run the default unit/integration suite:

```bash
pnpm test
```

Run Playwright smoke tests:

```bash
pnpm test:e2e:install   # once per machine
pnpm test:e2e
```

Playwright behavior:

- Without `DATABASE_URL`: builds the web app and checks the staff login page and auth redirect.
- With `DATABASE_URL` and seeded Postgres: also starts the API and runs a moderator sign-in smoke test.

For the authenticated Playwright smoke test, use the same setup as local development:

```bash
cp .env.example .env
docker compose up -d
pnpm db:reset
pnpm test:e2e
```

## Documentation

- [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md)
- [docs/ARCHITECTURE_PLAN.md](docs/ARCHITECTURE_PLAN.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/AI_WORKFLOW_TESTBED.md](docs/AI_WORKFLOW_TESTBED.md)
- [docs/EXPERIMENT_TEMPLATE.md](docs/EXPERIMENT_TEMPLATE.md)

## AI Testbed Value

This repo stresses AI tools with realistic software work: domain modeling, RBAC, moderation queues, shared validation, multi-app wiring, seed scripts, and tests — without becoming a giant production app.

Public project associated with [One Regular Dev](https://oneregulardev.com).
