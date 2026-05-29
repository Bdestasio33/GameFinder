import { closeDb, createDb, isDatabaseConnected } from "@gamefinder/db";
import { hasPermission, healthResponseSchema, PERMISSIONS } from "@gamefinder/shared";
import cors from "cors";
import express from "express";
import type { Application, NextFunction, Request, Response } from "express";
import type { Server } from "node:http";
import type { Database } from "@gamefinder/db";
import { getDatabaseUrl } from "./env.js";
import { createAuthMiddleware, type AuthenticatedRequest } from "./middleware/auth.js";
import { createAdminRouter, createGamesRouter } from "./routes/admin.js";
import { createAuthRouter } from "./routes/auth.js";
import { createModerationRouter } from "./routes/moderation.js";
import { createSuggestionsRouter } from "./routes/suggestions.js";
import { getPendingCounts } from "./services/games.js";

export function createApp(): { app: Application; db: Database } {
  const app = express();
  const db = createDb(getDatabaseUrl());

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(createAuthMiddleware(db));

  app.get("/health", async (_request, response) => {
    const database = (await isDatabaseConnected(db))
      ? "connected"
      : "disconnected";

    response.json(
      healthResponseSchema.parse({
        status: "ok",
        service: "gamefinder-api",
        database,
      }),
    );
  });

  app.get("/api/meta/filters", async (_request, response) => {
    const tags = await db.query.tags.findMany();
    response.json({
      genres: tags.filter((tag) => tag.kind === "genre"),
      platforms: tags.filter((tag) => tag.kind === "platform"),
    });
  });

  app.get("/api/meta/pending-counts", async (request, response) => {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!hasPermission(authRequest.user.role, PERMISSIONS.VIEW_MODERATION_QUEUE)) {
      response.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    response.json(await getPendingCounts(db));
  });

  app.use("/api/auth", createAuthRouter(db));
  app.use("/api/games", createGamesRouter(db));
  app.use("/api", createSuggestionsRouter(db));
  app.use("/api/moderation", createModerationRouter(db));
  app.use("/api/admin", createAdminRouter(db));

  app.use(
    (
      error: unknown,
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      console.error(error);
      response.status(500).json({ error: "Internal server error" });
    },
  );

  return { app, db };
}

export async function shutdown(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await closeDb();
}
