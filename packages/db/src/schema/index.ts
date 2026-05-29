import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roleSlugEnum = pgEnum("role_slug", [
  "guest",
  "user",
  "contributor",
  "moderator",
  "admin",
]);

export const moderationStatusEnum = pgEnum("moderation_status", [
  "pending",
  "approved",
  "rejected",
]);

export const officialRatingEnum = pgEnum("official_rating", [
  "E",
  "E10",
  "T",
  "M",
  "AO",
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "casual",
  "moderate",
  "challenging",
  "hardcore",
]);

export const expertiseLevelEnum = pgEnum("expertise_level", [
  "beginner",
  "casual",
  "intermediate",
  "advanced",
  "expert",
]);

export const playStyleEnum = pgEnum("play_style", [
  "solo",
  "co-op",
  "competitive",
  "online-multiplayer",
  "couch-co-op",
  "story-driven",
  "sandbox",
]);

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: roleSlugEnum("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const userRoles = pgTable(
  "user_roles",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  releaseYear: integer("release_year"),
  minAgeRecommendation: integer("min_age_recommendation"),
  officialRating: officialRatingEnum("official_rating"),
  difficultyLevel: difficultyLevelEnum("difficulty_level").notNull(),
  expertiseRequired: expertiseLevelEnum("expertise_required").notNull(),
  averageSessionMinutes: integer("average_session_minutes"),
  contentNotes: text("content_notes"),
  maxPlayers: integer("max_players"),
  playerCountLabel: text("player_count_label"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
});

export const gameTags = pgTable(
  "game_tags",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.tagId] })],
);

export const gamePlayStyles = pgTable(
  "game_play_styles",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    playStyle: playStyleEnum("play_style").notNull(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.playStyle] })],
);

export const ageSuggestions = pgTable("age_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  suggestedMinAge: integer("suggested_min_age").notNull(),
  rationale: text("rationale").notNull(),
  status: moderationStatusEnum("status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const expertiseSuggestions = pgTable("expertise_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  suggestedDifficulty: difficultyLevelEnum("suggested_difficulty").notNull(),
  suggestedExpertise: expertiseLevelEnum("suggested_expertise").notNull(),
  rationale: text("rationale").notNull(),
  status: moderationStatusEnum("status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const gameSuggestions = pgTable("game_suggestions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  releaseYear: integer("release_year"),
  genres: text("genres"),
  platforms: text("platforms"),
  status: moderationStatusEnum("status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const favorites = pgTable(
  "favorites",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.gameId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  roles: many(userRoles),
  sessions: many(sessions),
  ageSuggestions: many(ageSuggestions),
  expertiseSuggestions: many(expertiseSuggestions),
  gameSuggestions: many(gameSuggestions),
  favorites: many(favorites),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRoles.roleId],
    references: [roles.id],
  }),
}));

export const gamesRelations = relations(games, ({ many }) => ({
  tags: many(gameTags),
  playStyles: many(gamePlayStyles),
  ageSuggestions: many(ageSuggestions),
  expertiseSuggestions: many(expertiseSuggestions),
  favorites: many(favorites),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  games: many(gameTags),
}));

export const gameTagsRelations = relations(gameTags, ({ one }) => ({
  game: one(games, {
    fields: [gameTags.gameId],
    references: [games.id],
  }),
  tag: one(tags, {
    fields: [gameTags.tagId],
    references: [tags.id],
  }),
}));

export const gamePlayStylesRelations = relations(gamePlayStyles, ({ one }) => ({
  game: one(games, {
    fields: [gamePlayStyles.gameId],
    references: [games.id],
  }),
}));

export const ageSuggestionsRelations = relations(ageSuggestions, ({ one }) => ({
  game: one(games, {
    fields: [ageSuggestions.gameId],
    references: [games.id],
  }),
  user: one(users, {
    fields: [ageSuggestions.userId],
    references: [users.id],
  }),
}));

export const expertiseSuggestionsRelations = relations(
  expertiseSuggestions,
  ({ one }) => ({
    game: one(games, {
      fields: [expertiseSuggestions.gameId],
      references: [games.id],
    }),
    user: one(users, {
      fields: [expertiseSuggestions.userId],
      references: [users.id],
    }),
  }),
);

export const gameSuggestionsRelations = relations(gameSuggestions, ({ one }) => ({
  user: one(users, {
    fields: [gameSuggestions.userId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  game: one(games, {
    fields: [favorites.gameId],
    references: [games.id],
  }),
}));
