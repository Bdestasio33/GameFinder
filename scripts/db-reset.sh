#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> Stopping PostgreSQL and removing data volume..."
docker compose down -v

echo "==> Starting PostgreSQL..."
docker compose up -d --wait

echo "==> Migrating and seeding database..."
pnpm db:seed

echo "==> Database reset complete."
