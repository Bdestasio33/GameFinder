import { z } from "zod";
import {
  DIFFICULTY_LEVELS,
  EXPERTISE_LEVELS,
  MODERATION_STATUSES,
  OFFICIAL_RATINGS,
  PLAY_STYLES,
  ROLES,
} from "./constants.js";

export const roleSlugSchema = z.enum(ROLES);
export const moderationStatusSchema = z.enum(MODERATION_STATUSES);
export const officialRatingSchema = z.enum(OFFICIAL_RATINGS);
export const difficultyLevelSchema = z.enum(DIFFICULTY_LEVELS);
export const expertiseLevelSchema = z.enum(EXPERTISE_LEVELS);
export const playStyleSchema = z.enum(PLAY_STYLES);

export const tagSchema = z.object({
  slug: z.string(),
  name: z.string(),
  kind: z.string(),
});

export const videoGameSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  releaseYear: z.number().int().nullable(),
  genres: z.array(tagSchema),
  platforms: z.array(tagSchema),
  minAgeRecommendation: z.number().int().nullable(),
  officialRating: officialRatingSchema.nullable(),
  difficultyLevel: difficultyLevelSchema,
  expertiseRequired: expertiseLevelSchema,
  playStyles: z.array(playStyleSchema),
  averageSessionMinutes: z.number().int().nullable(),
  contentNotes: z.array(z.string()),
  maxPlayers: z.number().int().nullable(),
  playerCountLabel: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type VideoGame = z.infer<typeof videoGameSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ageSuggestionInputSchema = z.object({
  suggestedMinAge: z.number().int().min(0).max(21),
  rationale: z.string().min(10).max(500),
});

export const expertiseSuggestionInputSchema = z.object({
  suggestedDifficulty: difficultyLevelSchema,
  suggestedExpertise: expertiseLevelSchema,
  rationale: z.string().min(10).max(500),
});

export const gameSuggestionInputSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(10).max(1000),
  releaseYear: z.number().int().optional(),
  genres: z.array(z.string()).optional(),
  platforms: z.array(z.string()).optional(),
});

export const gameUpsertSchema = z.object({
  title: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(2000),
  releaseYear: z.number().int().nullable().optional(),
  minAgeRecommendation: z.number().int().nullable().optional(),
  officialRating: officialRatingSchema.nullable().optional(),
  difficultyLevel: difficultyLevelSchema,
  expertiseRequired: expertiseLevelSchema,
  playStyles: z.array(playStyleSchema).min(1),
  averageSessionMinutes: z.number().int().nullable().optional(),
  contentNotes: z.array(z.string()).optional(),
  maxPlayers: z.number().int().nullable().optional(),
  playerCountLabel: z.string().nullable().optional(),
  genres: z.array(z.string()).min(1),
  platforms: z.array(z.string()).min(1),
});

export const moderationDecisionSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNotes: z.string().max(500).optional(),
});

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  database: z.enum(["connected", "disconnected"]),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const sessionUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string(),
  role: roleSlugSchema,
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
