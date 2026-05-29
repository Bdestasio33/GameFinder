import { Router, type Router as RouterType } from "express";
import type { Database } from "@gamefinder/db";
import {
  moderationDecisionSchema,
  PERMISSIONS,
} from "@gamefinder/shared";
import {
  ageSuggestions,
  expertiseSuggestions,
  gameSuggestions,
} from "@gamefinder/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  requireAuth,
  requirePermission,
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { getPendingCounts } from "../services/games.js";

export function createModerationRouter(db: Database): RouterType {
  const router = Router();

  router.use(requireAuth, requirePermission(PERMISSIONS.VIEW_MODERATION_QUEUE));

  router.get("/queue", async (_request, response) => {
    const [counts, ageRows, expertiseRows, gameRows] = await Promise.all([
      getPendingCounts(db),
      db.query.ageSuggestions.findMany({
        where: eq(ageSuggestions.status, "pending"),
        with: { game: true, user: true },
        orderBy: [desc(ageSuggestions.createdAt)],
      }),
      db.query.expertiseSuggestions.findMany({
        where: eq(expertiseSuggestions.status, "pending"),
        with: { game: true, user: true },
        orderBy: [desc(expertiseSuggestions.createdAt)],
      }),
      db.query.gameSuggestions.findMany({
        where: eq(gameSuggestions.status, "pending"),
        with: { user: true },
        orderBy: [desc(gameSuggestions.createdAt)],
      }),
    ]);

    response.json({
      counts,
      ageSuggestions: ageRows,
      expertiseSuggestions: expertiseRows,
      gameSuggestions: gameRows,
    });
  });

  router.patch(
    "/age-suggestions/:id",
    requirePermission(PERMISSIONS.MODERATE_SUGGESTIONS),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = moderationDecisionSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid moderation payload" });
        return;
      }

      const [updated] = await db
        .update(ageSuggestions)
        .set({
          status: body.data.status,
          reviewNotes: body.data.reviewNotes ?? null,
          reviewedBy: authRequest.user!.id,
          reviewedAt: new Date(),
        })
        .where(eq(ageSuggestions.id, String(request.params.id)))
        .returning();

      if (!updated) {
        response.status(404).json({ error: "Suggestion not found" });
        return;
      }

      response.json(updated);
    },
  );

  router.patch(
    "/expertise-suggestions/:id",
    requirePermission(PERMISSIONS.MODERATE_SUGGESTIONS),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = moderationDecisionSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid moderation payload" });
        return;
      }

      const [updated] = await db
        .update(expertiseSuggestions)
        .set({
          status: body.data.status,
          reviewNotes: body.data.reviewNotes ?? null,
          reviewedBy: authRequest.user!.id,
          reviewedAt: new Date(),
        })
        .where(eq(expertiseSuggestions.id, String(request.params.id)))
        .returning();

      if (!updated) {
        response.status(404).json({ error: "Suggestion not found" });
        return;
      }

      response.json(updated);
    },
  );

  router.patch(
    "/game-suggestions/:id",
    requirePermission(PERMISSIONS.MODERATE_SUGGESTIONS),
    async (request, response) => {
      const authRequest = request as AuthenticatedRequest;
      const body = moderationDecisionSchema.safeParse(request.body);

      if (!body.success) {
        response.status(400).json({ error: "Invalid moderation payload" });
        return;
      }

      const [updated] = await db
        .update(gameSuggestions)
        .set({
          status: body.data.status,
          reviewNotes: body.data.reviewNotes ?? null,
          reviewedBy: authRequest.user!.id,
          reviewedAt: new Date(),
        })
        .where(eq(gameSuggestions.id, String(request.params.id)))
        .returning();

      if (!updated) {
        response.status(404).json({ error: "Suggestion not found" });
        return;
      }

      response.json(updated);
    },
  );

  return router;
}
