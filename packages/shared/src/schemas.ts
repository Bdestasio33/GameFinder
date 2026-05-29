import { z } from "zod";
import { COMPLEXITY_LEVELS, ROLES, SUGGESTION_STATUSES } from "./constants.js";

export const roleSlugSchema = z.enum(ROLES);

export const suggestionStatusSchema = z.enum(SUGGESTION_STATUSES);

export const complexityLevelSchema = z.coerce
  .number()
  .int()
  .refine((value): value is (typeof COMPLEXITY_LEVELS)[number] =>
    COMPLEXITY_LEVELS.includes(value as (typeof COMPLEXITY_LEVELS)[number]),
  );

export const gameSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  minPlayers: z.number().int().min(1),
  maxPlayers: z.number().int().min(1),
  minPlayTimeMinutes: z.number().int().min(1).nullable(),
  maxPlayTimeMinutes: z.number().int().min(1).nullable(),
  publisher: z.string().nullable(),
  publishedYear: z.number().int().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Game = z.infer<typeof gameSchema>;

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  database: z.enum(["connected", "disconnected"]),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
