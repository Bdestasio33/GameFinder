export const ROLES = [
  "guest",
  "user",
  "contributor",
  "moderator",
  "admin",
] as const;

export type RoleSlug = (typeof ROLES)[number];

export const MODERATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;

export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const OFFICIAL_RATINGS = ["E", "E10", "T", "M", "AO"] as const;

export type OfficialRating = (typeof OFFICIAL_RATINGS)[number];

export const DIFFICULTY_LEVELS = [
  "casual",
  "moderate",
  "challenging",
  "hardcore",
] as const;

export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const EXPERTISE_LEVELS = [
  "beginner",
  "casual",
  "intermediate",
  "advanced",
  "expert",
] as const;

export type ExpertiseLevel = (typeof EXPERTISE_LEVELS)[number];

export const PLAY_STYLES = [
  "solo",
  "co-op",
  "competitive",
  "online-multiplayer",
  "couch-co-op",
  "story-driven",
  "sandbox",
] as const;

export type PlayStyle = (typeof PLAY_STYLES)[number];

export const TAG_KINDS = ["genre", "platform", "content"] as const;

export type TagKind = (typeof TAG_KINDS)[number];
