import { Router, type Router as RouterType } from "express";
import type { Database } from "@gamefinder/db";
import { gameUpsertSchema, PERMISSIONS } from "@gamefinder/shared";
import {
  requireAuth,
  requirePermission,
} from "../middleware/auth.js";
import {
  createGame,
  deleteGame,
  getGameBySlug,
  listGames,
  updateGame,
} from "../services/games.js";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function createAdminRouter(db: Database): RouterType {
  const router = Router();

  router.use(requireAuth);

  router.get(
    "/users",
    requirePermission(PERMISSIONS.MANAGE_USERS),
    async (_request, response) => {
      const rows = await db.query.users.findMany({
        with: {
          roles: {
            with: {
              role: true,
            },
          },
        },
      });

      response.json(
        rows.map((user) => ({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.roles[0]?.role.slug ?? "user",
        })),
      );
    },
  );

  router.get(
    "/roles",
    requirePermission(PERMISSIONS.MANAGE_USERS),
    async (_request, response) => {
      const rows = await db.query.roles.findMany();
      response.json(rows);
    },
  );

  router.post(
    "/games",
    requirePermission(PERMISSIONS.MANAGE_GAMES),
    async (request, response) => {
      const body = gameUpsertSchema.safeParse(request.body);
      if (!body.success) {
        response.status(400).json({ error: "Invalid game payload" });
        return;
      }

      const slug = body.data.slug ?? slugify(body.data.title);
      const created = await createGame(db, {
        ...body.data,
        slug,
      });

      response.status(201).json(created);
    },
  );

  router.put(
    "/games/:id",
    requirePermission(PERMISSIONS.MANAGE_GAMES),
    async (request, response) => {
      const body = gameUpsertSchema.safeParse(request.body);
      if (!body.success) {
        response.status(400).json({ error: "Invalid game payload" });
        return;
      }

      const updated = await updateGame(db, String(request.params.id), {
        ...body.data,
        slug: body.data.slug ?? slugify(body.data.title),
      });

      if (!updated) {
        response.status(404).json({ error: "Game not found" });
        return;
      }

      response.json(updated);
    },
  );

  router.delete(
    "/games/:id",
    requirePermission(PERMISSIONS.MANAGE_GAMES),
    async (request, response) => {
      const deleted = await deleteGame(db, String(request.params.id));

      if (!deleted) {
        response.status(404).json({ error: "Game not found" });
        return;
      }

      response.json({ ok: true });
    },
  );

  return router;
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function createGamesRouter(db: Database): RouterType {
  const router = Router();

  router.get("/", async (request, response) => {
    const gamesList = await listGames(db, {
      search: request.query.search as string | undefined,
      maxAge: parseOptionalInt(request.query.maxAge),
      difficulty: request.query.difficulty as never,
      expertise: request.query.expertise as never,
      genre: request.query.genre as string | undefined,
      platform: request.query.platform as string | undefined,
      playStyle: request.query.playStyle as never,
    });

    response.json(gamesList);
  });

  router.get("/:slug", async (request, response) => {
    const game = await getGameBySlug(db, String(request.params.slug));
    if (!game) {
      response.status(404).json({ error: "Game not found" });
      return;
    }

    response.json(game);
  });

  return router;
}
