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
- Web catalog, filters, game detail, suggestions, moderation, admin
- Mobile read-only catalog with search and detail
- Unit + API integration tests

## Quick Start

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:reset
pnpm dev
```

- Web: http://localhost:5173
- API: http://localhost:3001
- Postgres: localhost:5433

### Demo users (testbed auth only)

| Email | Password | Role |
|-------|----------|------|
| admin@gametest.local | admin123 | admin |
| moderator@gametest.local | mod123 | moderator |
| user@gametest.local | user123 | user |
| contributor@gametest.local | contrib123 | contributor |

**Warning:** Demo credentials and session auth are for local testbed use only. Do not deploy this auth model to production.

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages/apps |
| `pnpm test` | Run unit + integration tests |
| `pnpm db:reset` | Wipe Postgres volume and reseed |
| `pnpm db:seed` | Reseed existing database |

## Documentation

- [docs/PROJECT_VISION.md](docs/PROJECT_VISION.md)
- [docs/ARCHITECTURE_PLAN.md](docs/ARCHITECTURE_PLAN.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/AI_WORKFLOW_TESTBED.md](docs/AI_WORKFLOW_TESTBED.md)
- [docs/EXPERIMENT_TEMPLATE.md](docs/EXPERIMENT_TEMPLATE.md)

## AI Testbed Value

This repo stresses AI tools with realistic software work: domain modeling, RBAC, moderation queues, shared validation, multi-app wiring, seed scripts, and tests — without becoming a giant production app.

Public project associated with [One Regular Dev](https://oneregulardev.com).
