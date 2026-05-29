import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { resolve } from "node:path";
import { closeDb, createDb } from "./client.js";
import { getDatabaseUrl } from "./env.js";
import {
  ageRatings,
  collections,
  collectionGames,
  complexityRatings,
  gameSuggestions,
  games,
  gameTags,
  reviews,
  roles,
  tags,
  userRoles,
  users,
} from "./schema/index.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

const seedRoles = [
  { slug: "guest" as const, name: "Guest", description: "Browse public catalog" },
  { slug: "user" as const, name: "User", description: "Contribute ratings and lists" },
  {
    slug: "contributor" as const,
    name: "Contributor",
    description: "Trusted community contributor",
  },
  {
    slug: "moderator" as const,
    name: "Moderator",
    description: "Review suggestions and curate catalog",
  },
  { slug: "admin" as const, name: "Admin", description: "Full system access" },
];

const seedUsers = [
  {
    email: "admin@gamefinder.local",
    displayName: "Admin User",
    roleSlug: "admin" as const,
  },
  {
    email: "mod@gamefinder.local",
    displayName: "Moderator User",
    roleSlug: "moderator" as const,
  },
  {
    email: "parent@gamefinder.local",
    displayName: "Parent User",
    roleSlug: "user" as const,
  },
];

const seedTags = [
  { slug: "family", name: "Family", kind: "category" },
  { slug: "strategy", name: "Strategy", kind: "category" },
  { slug: "cooperative", name: "Cooperative", kind: "mechanic" },
  { slug: "party", name: "Party", kind: "category" },
];

const seedGames = [
  {
    title: "Ticket to Ride",
    description: "Route-building train game suitable for families and casual strategy fans.",
    minPlayers: 2,
    maxPlayers: 5,
    minPlayTimeMinutes: 30,
    maxPlayTimeMinutes: 60,
    publisher: "Days of Wonder",
    publishedYear: 2004,
    tagSlugs: ["family", "strategy"],
  },
  {
    title: "Codenames",
    description: "Word association party game that scales well for groups.",
    minPlayers: 4,
    maxPlayers: 8,
    minPlayTimeMinutes: 15,
    maxPlayTimeMinutes: 30,
    publisher: "Czech Games Edition",
    publishedYear: 2015,
    tagSlugs: ["party"],
  },
  {
    title: "Pandemic",
    description: "Cooperative board game where players work together to stop outbreaks.",
    minPlayers: 2,
    maxPlayers: 4,
    minPlayTimeMinutes: 45,
    maxPlayTimeMinutes: 60,
    publisher: "Z-Man Games",
    publishedYear: 2008,
    tagSlugs: ["cooperative", "strategy"],
  },
];

async function resetDatabase(db: ReturnType<typeof createDb>) {
  await db.execute(sql`
    TRUNCATE TABLE
      collection_games,
      collections,
      game_suggestions,
      reviews,
      complexity_ratings,
      age_ratings,
      game_tags,
      games,
      tags,
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
    seedUsers.map(({ email, displayName }) => ({ email, displayName })),
  ).returning();

  await db.insert(userRoles).values(
    insertedUsers.map((user, index) => ({
      userId: user.id,
      roleId: roleBySlug[seedUsers[index]!.roleSlug]!.id,
    })),
  );

  console.log("Seeding tags...");
  const insertedTags = await db.insert(tags).values(seedTags).returning();
  const tagBySlug = Object.fromEntries(
    insertedTags.map((tag) => [tag.slug, tag]),
  );

  console.log("Seeding games...");
  const insertedGames = await db.insert(games).values(
    seedGames.map(({ tagSlugs: _tagSlugs, ...game }) => game),
  ).returning();

  await db.insert(gameTags).values(
    insertedGames.flatMap((game, index) =>
      seedGames[index]!.tagSlugs.map((slug) => ({
        gameId: game.id,
        tagId: tagBySlug[slug]!.id,
      })),
    ),
  );

  const parentUser = insertedUsers.find(
    (user) => user.email === "parent@gamefinder.local",
  )!;

  console.log("Seeding sample ratings and collections...");
  await db.insert(ageRatings).values([
    {
      gameId: insertedGames[0]!.id,
      userId: parentUser.id,
      minimumAge: 8,
      notes: "Rules are straightforward after one teaching game.",
    },
    {
      gameId: insertedGames[1]!.id,
      userId: parentUser.id,
      minimumAge: 10,
      notes: "Best with teens and adults who enjoy wordplay.",
    },
  ]);

  await db.insert(complexityRatings).values([
    {
      gameId: insertedGames[0]!.id,
      userId: parentUser.id,
      rating: 2,
      notes: "Light strategy with simple turns.",
    },
    {
      gameId: insertedGames[2]!.id,
      userId: parentUser.id,
      rating: 3,
      notes: "Moderate cooperative planning.",
    },
  ]);

  await db.insert(reviews).values([
    {
      gameId: insertedGames[0]!.id,
      userId: parentUser.id,
      content: "Great gateway game for family game night.",
      rating: 5,
    },
  ]);

  const [familyShelf] = await db
    .insert(collections)
    .values({
      userId: parentUser.id,
      name: "Family Shelf",
      description: "Games we keep ready for weekend play.",
    })
    .returning();

  await db.insert(collectionGames).values([
    { collectionId: familyShelf!.id, gameId: insertedGames[0]!.id },
    { collectionId: familyShelf!.id, gameId: insertedGames[1]!.id },
  ]);

  await db.insert(gameSuggestions).values([
    {
      userId: parentUser.id,
      title: "Azul",
      details: "Abstract strategy game that works well from age 8+.",
      status: "submitted",
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
