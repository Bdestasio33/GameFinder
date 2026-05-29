import { Router, type Router as RouterType } from "express";
import type { Database } from "@gamefinder/db";
import {
  ageSuggestionInputSchema,
  expertiseSuggestionInputSchema,
  gameSuggestionInputSchema,
  PERMISSIONS,
} from "@gamefinder/shared";
import {
  ageSuggestions,
  expertiseSuggestions,
  favorites,
  gameSuggestions,
  games,
} from "@gamefinder/db/schema";
import { and, desc, eq } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { toggleFavorite } from "../services/games.js";

export function createSuggestionsRouter(db: Database): RouterType {
  const router = Router();

  router.get(
    "/me/suggestions",
    requireAuth,
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const userId = authRequest.user!.id;

      const [ageRows, expertiseRows, gameRows, favoriteRows] =
        await Promise.all([
          db.query.ageSuggestions.findMany({
            where: eq(ageSuggestions.userId, userId),
            with: { game: true },
            orderBy: [desc(ageSuggestions.createdAt)],
          }),
          db.query.expertiseSuggestions.findMany({
            where: eq(expertiseSuggestions.userId, userId),
            with: { game: true },
            orderBy: [desc(expertiseSuggestions.createdAt)],
          }),
          db.query.gameSuggestions.findMany({
            where: eq(gameSuggestions.userId, userId),
            orderBy: [desc(gameSuggestions.createdAt)],
          }),
          db.query.favorites.findMany({
            where: eq(favorites.userId, userId),
            with: { game: true },
          }),
        ]);

      response.json({
        ageSuggestions: ageRows,
        expertiseSuggestions: expertiseRows,
        gameSuggestions: gameRows,
        favorites: favoriteRows.map(({ game }) => ({
          id: game.id,
          title: game.title,
          slug: game.slug,
        })),
      });
    },
  );

  router.post(
    "/games/:gameId/age-suggestions",
    requireAuth,
    requirePermission(PERMISSIONS.SUBMIT_AGE_SUGGESTION),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = ageSuggestionInputSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid suggestion payload" });
        return;
      }

      const game = await db.query.games.findFirst({
        where: eq(games.id, String(request.params.gameId)),
      });

      if (!game) {
        response.status(404).json({ error: "Game not found" });
        return;
      }

      const [created] = await db
        .insert(ageSuggestions)
        .values({
          gameId: game.id,
          userId: authRequest.user!.id,
          suggestedMinAge: body.data.suggestedMinAge,
          rationale: body.data.rationale,
        })
        .returning();

      response.status(201).json(created);
    },
  );

  router.post(
    "/games/:gameId/expertise-suggestions",
    requireAuth,
    requirePermission(PERMISSIONS.SUBMIT_EXPERTISE_SUGGESTION),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = expertiseSuggestionInputSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid suggestion payload" });
        return;
      }

      const game = await db.query.games.findFirst({
        where: eq(games.id, String(request.params.gameId)),
      });

      if (!game) {
        response.status(404).json({ error: "Game not found" });
        return;
      }

      const [created] = await db
        .insert(expertiseSuggestions)
        .values({
          gameId: game.id,
          userId: authRequest.user!.id,
          suggestedDifficulty: body.data.suggestedDifficulty,
          suggestedExpertise: body.data.suggestedExpertise,
          rationale: body.data.rationale,
        })
        .returning();

      response.status(201).json(created);
    },
  );

  router.post(
    "/game-suggestions",
    requireAuth,
    requirePermission(PERMISSIONS.SUBMIT_GAME_SUGGESTION),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = gameSuggestionInputSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid game suggestion payload" });
        return;
      }

      const [created] = await db
        .insert(gameSuggestions)
        .values({
          userId: authRequest.user!.id,
          title: body.data.title,
          description: body.data.description,
          releaseYear: body.data.releaseYear ?? null,
          genres: body.data.genres?.join(",") ?? null,
          platforms: body.data.platforms?.join(",") ?? null,
        })
        .returning();

      response.status(201).json(created);
    },
  );

  router.post(
    "/games/:gameId/favorite",
    requireAuth,
    requirePermission(PERMISSIONS.FAVORITE_GAMES),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const result = await toggleFavorite(
        db,
        authRequest.user!.id,
        String(request.params.gameId),
      );

      if (!result) {
        response.status(404).json({ error: "Game not found" });
        return;
      }

      response.json(result);
    },
  );

  return router;
}
