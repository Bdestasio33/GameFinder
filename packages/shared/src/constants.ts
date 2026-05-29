export const ROLES = [
  "guest",
  "user",
  "contributor",
  "moderator",
  "admin",
] as const;

export type RoleSlug = (typeof ROLES)[number];

export const SUGGESTION_STATUSES = [
  "submitted",
  "under_review",
  "accepted",
  "rejected",
] as const;

export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const COMPLEXITY_LEVELS = [1, 2, 3, 4, 5] as const;

export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];
