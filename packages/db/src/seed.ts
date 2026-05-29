import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import { resolve } from "node:path";
import { closeDb, createDb } from "./client.js";
import { getDatabaseUrl } from "./env.js";
import {
  ageSuggestions,
  expertiseSuggestions,
  favorites,
  gamePlayStyles,
  gameSuggestions,
  games,
  gameTags,
  roles,
  tags,
  userRoles,
  users,
} from "./schema/index.js";
import { SEED_GAMES, SEED_GENRES, SEED_PLATFORMS } from "./seed/games-data.js";

config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

const seedRoles = [
  { slug: "guest" as const, name: "Guest", description: "Browse public catalog" },
  { slug: "user" as const, name: "User", description: "Contribute suggestions" },
  {
    slug: "contributor" as const,
    name: "Contributor",
    description: "Submit new game suggestions",
  },
  {
    slug: "moderator" as const,
    name: "Moderator",
    description: "Review pending suggestions",
  },
  { slug: "admin" as const, name: "Admin", description: "Full system access" },
];

const seedUsers = [
  {
    email: "admin@gametest.local",
    displayName: "Admin User",
    password: "admin123",
    roleSlug: "admin" as const,
  },
  {
    email: "moderator@gametest.local",
    displayName: "Moderator User",
    password: "mod123",
    roleSlug: "moderator" as const,
  },
  {
    email: "user@gametest.local",
    displayName: "Regular User",
    password: "user123",
    roleSlug: "user" as const,
  },
  {
    email: "contributor@gametest.local",
    displayName: "Contributor User",
    password: "contrib123",
    roleSlug: "contributor" as const,
  },
];

async function resetDatabase(db: ReturnType<typeof createDb>) {
  await db.execute(sql`
    TRUNCATE TABLE
      favorites,
      game_suggestions,
      expertise_suggestions,
      age_suggestions,
      game_play_styles,
      game_tags,
      games,
      tags,
      sessions,
      user_roles,
      users,
      roles
    RESTART IDENTITY CASCADE
  `);
}

async function main() {
  const databaseUrl = getDatabaseUrl();
  const migrationConnection = postgres(databaseUrl, { max: 1 });
  const migrationDb = drizzle(migrationConnection);

  console.log("Running migrations...");
  await migrate(migrationDb, { migrationsFolder: "./drizzle" });
  await migrationConnection.end();

  const db = createDb(databaseUrl);

  console.log("Resetting seed data...");
  await resetDatabase(db);

  console.log("Seeding roles...");
  const insertedRoles = await db.insert(roles).values(seedRoles).returning();
  const roleBySlug = Object.fromEntries(
    insertedRoles.map((role) => [role.slug, role]),
  );

  console.log("Seeding users...");
  const insertedUsers = await db.insert(users).values(
    await Promise.all(
      seedUsers.map(async ({ email, displayName, password }) => ({
        email,
        displayName,
        passwordHash: await hash(password, 10),
      })),
    ),
  ).returning();

  await db.insert(userRoles).values(
    insertedUsers.map((user, index) => ({
      userId: user.id,
      roleId: roleBySlug[seedUsers[index]!.roleSlug]!.id,
    })),
  );

  const userByEmail = Object.fromEntries(
    insertedUsers.map((user) => [user.email, user]),
  );

  console.log("Seeding taxonomy...");
  const insertedTags = await db
    .insert(tags)
    .values([
      ...SEED_GENRES.map((genre) => ({
        slug: genre.slug,
        name: genre.name,
        kind: "genre",
      })),
      ...SEED_PLATFORMS.map((platform) => ({
        slug: platform.slug,
        name: platform.name,
        kind: "platform",
      })),
    ])
    .returning();

  const tagBySlug = Object.fromEntries(
    insertedTags.map((tag) => [tag.slug, tag]),
  );

  console.log("Seeding video games...");
  const insertedGames = await db
    .insert(games)
    .values(
      SEED_GAMES.map((game) => ({
        title: game.title,
        slug: game.slug,
        description: game.description,
        releaseYear: game.releaseYear,
        minAgeRecommendation: game.minAgeRecommendation,
        officialRating: game.officialRating,
        difficultyLevel: game.difficultyLevel,
        expertiseRequired: game.expertiseRequired,
        averageSessionMinutes: game.averageSessionMinutes,
        contentNotes: game.contentNotes.join("|"),
        maxPlayers: game.maxPlayers,
        playerCountLabel: game.playerCountLabel,
      })),
    )
    .returning();

  await db.insert(gameTags).values(
    insertedGames.flatMap((game, index) => {
      const seedGame = SEED_GAMES[index]!;
      const tagSlugs = [...seedGame.genres, ...seedGame.platforms];
      return tagSlugs.map((slug) => ({
        gameId: game.id,
        tagId: tagBySlug[slug]!.id,
      }));
    }),
  );

  await db.insert(gamePlayStyles).values(
    insertedGames.flatMap((game, index) =>
      SEED_GAMES[index]!.playStyles.map((playStyle) => ({
        gameId: game.id,
        playStyle,
      })),
    ),
  );

  const regularUser = userByEmail["user@gametest.local"]!;
  const minecraft = insertedGames.find((game) => game.slug === "minecraft")!;
  const fortnite = insertedGames.find((game) => game.slug === "fortnite")!;

  console.log("Seeding sample suggestions and favorites...");
  await db.insert(favorites).values([
    { userId: regularUser.id, gameId: minecraft.id },
    { userId: regularUser.id, gameId: fortnite.id },
  ]);

  await db.insert(ageSuggestions).values([
    {
      gameId: fortnite.id,
      userId: regularUser.id,
      suggestedMinAge: 12,
      rationale:
        "Building and team modes feel suitable for younger teens with supervision.",
      status: "pending",
    },
    {
      gameId: minecraft.id,
      userId: regularUser.id,
      suggestedMinAge: 8,
      rationale:
        "Creative mode is widely used by younger players in family settings.",
      status: "approved",
      reviewedBy: userByEmail["moderator@gametest.local"]!.id,
      reviewedAt: new Date(),
    },
  ]);

  await db.insert(expertiseSuggestions).values([
    {
      gameId: insertedGames.find((game) => game.slug === "elden-ring")!.id,
      userId: regularUser.id,
      suggestedDifficulty: "hardcore",
      suggestedExpertise: "expert",
      rationale:
        "Combat timing and build planning expect strong action RPG experience.",
      status: "pending",
    },
  ]);

  await db.insert(gameSuggestions).values([
    {
      userId: userByEmail["contributor@gametest.local"]!.id,
      title: "Hades",
      description:
        "Fast roguelike action game with strong narrative and replayable runs.",
      releaseYear: 2020,
      genres: "action,rpg",
      platforms: "pc,switch",
      status: "pending",
    },
  ]);

  console.log("Seed complete.");
  console.log(`  Roles: ${insertedRoles.length}`);
  console.log(`  Users: ${insertedUsers.length}`);
  console.log(`  Games: ${insertedGames.length}`);
  console.log(`  Tags: ${insertedTags.length}`);

  await closeDb();
}

main().catch(async (error) => {
  console.error("Seed failed:", error);
  await closeDb();
  process.exit(1);
});
