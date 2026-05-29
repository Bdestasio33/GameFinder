# Architecture Plan

## Monorepo Layout

```
GameFinder/
├── apps/
│   ├── web/          # React product + moderation/admin UI
│   ├── mobile/       # Expo read-only catalog
│   └── api/          # Express API + auth + RBAC
├── packages/
│   ├── shared/       # Types, Zod schemas, permissions
│   ├── db/           # Drizzle schema, migrations, seed
│   └── config/       # Shared TypeScript config
├── docs/
└── ai-context/
```

## Runtime Architecture

- **Web/mobile clients** call the API over HTTP.
- **API** enforces RBAC using shared permission helpers.
- **PostgreSQL** stores games, suggestions, sessions, and roles.
- **Shared package** owns domain constants and validation.

## Domain Model

- `users`, `roles`, `user_roles`, `sessions`
- `games`, `tags`, `game_tags`, `game_play_styles`
- `age_suggestions`, `expertise_suggestions`, `game_suggestions`
- `favorites`

## RBAC

Permissions are defined once in `@gamefinder/shared` and checked in API middleware. UI uses the same helpers for navigation visibility — never as the sole authorization layer.

## Auth (demo only)

Local email/password auth with bcrypt hashes and opaque session tokens stored in PostgreSQL. **Not production-ready.**

## Testing Layers

- Unit tests for permissions and schemas (`packages/shared`)
- API integration tests with Supertest (`apps/api`)
- Manual exploratory testing for web/mobile UX
