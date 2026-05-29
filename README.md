# GameFinder

GameFinder is a public AI workflow testbed disguised as a realistic board-game discovery product. It helps users find, rank, and recommend board games based on age range, complexity, player count, play time, role or use case, and expertise level.

## Why This Project Exists

Most AI tool comparisons happen on toy examples or one-off prompts. GameFinder provides a repeatable, realistic monorepo benchmark: shared types, PostgreSQL, Drizzle migrations, API, web and mobile clients, and seed data you can reset cleanly across machines.

## Current Status

**Phase 1 complete — monorepo scaffolding**

This initial commit establishes the Turborepo workspace, PostgreSQL schema, Drizzle migrations, deterministic seed data, and stub clients wired to a live API. The following are **not** implemented yet: authentication, RBAC enforcement, discovery filters, suggestion workflows, and moderation UI.

### What is in the repo now

| Area | Status |
|------|--------|
| Turborepo + pnpm workspaces | Done |
| Docker Compose (PostgreSQL) | Done |
| Drizzle schema + migrations | Done |
| Deterministic seed script | Done |
| Shared types and Zod validation | Done |
| API (`/health`, `/api/games`) | Done |
| Web client (lists seeded games) | Stub |
| Mobile client (Expo, lists seeded games) | Stub |
| Auth and RBAC | Planned |
| AI experiment docs | Planned (intentionally deferred) |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo, pnpm workspaces |
| Web client | React, Vite, TypeScript |
| Mobile client | Expo, React Native, TypeScript |
| API | Node.js, Express, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Local development | Docker Compose |

## Monorepo Structure

```
GameFinder/
├── apps/
│   ├── web/          # React web client
│   ├── mobile/       # Expo React Native app
│   └── api/          # Node/TypeScript API
├── packages/
│   ├── shared/       # Shared types, validation, constants
│   ├── db/           # Drizzle schema, migrations, seed
│   └── config/       # Shared TypeScript config
├── ai-context/       # AI workflow experiment context (future)
└── docker-compose.yml
```

## Quick Start

Prerequisites: Node.js 20+, pnpm 9+, Docker

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:seed
pnpm dev
```

That gives you:

- PostgreSQL on `localhost:5433` (mapped to avoid conflicts with a local Postgres on 5432)
- Migrations applied and deterministic seed data loaded
- API on `http://localhost:3001`
- Web app on `http://localhost:5173`
- Expo dev server via the mobile app package

### Reset local database

```bash
docker compose down -v
docker compose up -d
pnpm db:seed
```

`pnpm db:seed` runs migrations and reseeds from scratch, so every machine gets the same baseline data.

## Useful Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all app dev servers via Turborepo |
| `pnpm build` | Build all packages and apps |
| `pnpm db:generate` | Generate Drizzle migrations from schema changes |
| `pnpm db:migrate` | Apply migrations only |
| `pnpm db:seed` | Migrate + reset/seed development data |
| `pnpm db:setup` | Alias for migrate then seed |

## Database Schema

The initial Drizzle schema models the planned domain:

- **Users and roles** — `users`, `roles`, `user_roles` (guest, user, contributor, moderator, admin)
- **Catalog** — `games`, `tags`, `game_tags`
- **Community data** — `age_ratings`, `complexity_ratings`, `reviews`
- **User content** — `collections`, `collection_games`, `game_suggestions`

Migrations live in `packages/db/drizzle/`. The seed script truncates and reloads all tables for a clean, reproducible baseline.

### Seed data

| Entity | Count |
|--------|-------|
| Roles | 5 |
| Users | 3 (admin, moderator, parent) |
| Tags | 4 (family, strategy, cooperative, party) |
| Games | 3 (Ticket to Ride, Codenames, Pandemic) |

Seed also includes sample age/complexity ratings, a review, a personal collection, and a pending game suggestion.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service and database health check |
| GET | `/api/games` | List seeded games with tags |

## Core Feature Areas (planned)

- Discovery by age, complexity, player count, play time, and tags
- Community age and complexity ratings
- Game suggestions and moderation
- Personal collections
- RBAC across guest, user, contributor, moderator, and admin roles

## AI Workflow Testbed

This repo is also a structured experiment surface for comparing AI-assisted development workflows across tools such as Cursor, Claude, ChatGPT, Replit, Lovable, Codex, and others.

Project documentation and experiment logs are intentionally deferred — creating that material is part of the test process itself. Context files will live in `ai-context/` as experiments begin.

## Contributing

Public project associated with [One Regular Dev](https://oneregulardev.com). Issues, experiment logs, and workflow comparisons welcome.
