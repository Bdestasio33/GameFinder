import type { Database } from "@gamefinder/db";
import {
  ageSuggestions,
  expertiseSuggestions,
  favorites,
  gamePlayStyles,
  gameSuggestions,
  games,
  gameTags,
  tags,
} from "@gamefinder/db/schema";
import {
  and,
  asc,
  eq,
  sql,
} from "drizzle-orm";
import type { DifficultyLevel, ExpertiseLevel, PlayStyle } from "@gamefinder/shared";
import { gameWithRelations, mapGame } from "../lib/map-game.js";

export type GameFilters = {
  search?: string;
  maxAge?: number;
  difficulty?: DifficultyLevel;
  expertise?: ExpertiseLevel;
  genre?: string;
  platform?: string;
  playStyle?: PlayStyle;
};

export async function listGames(db: Database, filters: GameFilters = {}) {
  const rows = await db.query.games.findMany({
    with: gameWithRelations,
    orderBy: [asc(games.title)],
  });

  return rows
    .map(mapGame)
    .filter((game) => {
      if (filters.search) {
        const query = filters.search.toLowerCase();
        if (!game.title.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (
        filters.maxAge !== undefined &&
        game.minAgeRecommendation !== null &&
        game.minAgeRecommendation > filters.maxAge
      ) {
        return false;
      }

      if (filters.difficulty && game.difficultyLevel !== filters.difficulty) {
        return false;
      }

      if (filters.expertise && game.expertiseRequired !== filters.expertise) {
        return false;
      }

      if (
        filters.genre &&
        !game.genres.some((genre) => genre.slug === filters.genre)
      ) {
        return false;
      }

      if (
        filters.platform &&
        !game.platforms.some((platform) => platform.slug === filters.platform)
      ) {
        return false;
      }

      if (
        filters.playStyle &&
        !game.playStyles.includes(filters.playStyle)
      ) {
        return false;
      }

      return true;
    });
}

export async function getGameBySlug(db: Database, slug: string) {
  const game = await db.query.games.findFirst({
    where: eq(games.slug, slug),
    with: gameWithRelations,
  });

  return game ? mapGame(game) : null;
}

export async function upsertTags(
  db: Database,
  entries: Array<{ slug: string; name: string; kind: string }>,
) {
  const results = [];

  for (const entry of entries) {
    const existing = await db.query.tags.findFirst({
      where: eq(tags.slug, entry.slug),
    });

    if (existing) {
      results.push(existing);
      continue;
    }

    const [created] = await db.insert(tags).values(entry).returning();
    results.push(created!);
  }

  return results;
}

export async function createGame(
  db: Database,
  input: {
    title: string;
    slug: string;
    description: string;
    releaseYear?: number | null;
    minAgeRecommendation?: number | null;
    officialRating?: string | null;
    difficultyLevel: DifficultyLevel;
    expertiseRequired: ExpertiseLevel;
    playStyles: PlayStyle[];
    averageSessionMinutes?: number | null;
    contentNotes?: string[];
    maxPlayers?: number | null;
    playerCountLabel?: string | null;
    genres: string[];
    platforms: string[];
  },
) {
  const [created] = await db
    .insert(games)
    .values({
      title: input.title,
      slug: input.slug,
      description: input.description,
      releaseYear: input.releaseYear ?? null,
      minAgeRecommendation: input.minAgeRecommendation ?? null,
      officialRating: input.officialRating as never,
      difficultyLevel: input.difficultyLevel,
      expertiseRequired: input.expertiseRequired,
      averageSessionMinutes: input.averageSessionMinutes ?? null,
      contentNotes: input.contentNotes?.join("|") ?? "",
      maxPlayers: input.maxPlayers ?? null,
      playerCountLabel: input.playerCountLabel ?? null,
    })
    .returning();

  const genreTags = await upsertTags(
    db,
    input.genres.map((slug) => ({
      slug,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      kind: "genre",
    })),
  );

  const platformTags = await upsertTags(
    db,
    input.platforms.map((slug) => ({
      slug,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      kind: "platform",
    })),
  );

  await db.insert(gameTags).values(
    [...genreTags, ...platformTags].map((tag) => ({
      gameId: created!.id,
      tagId: tag.id,
    })),
  );

  await db.insert(gamePlayStyles).values(
    input.playStyles.map((playStyle) => ({
      gameId: created!.id,
      playStyle,
    })),
  );

  return getGameBySlug(db, created!.slug);
}

export async function updateGame(
  db: Database,
  gameId: string,
  input: Partial<Parameters<typeof createGame>[1]>,
) {
  await db
    .update(games)
    .set({
      title: input.title,
      slug: input.slug,
      description: input.description,
      releaseYear: input.releaseYear,
      minAgeRecommendation: input.minAgeRecommendation,
      officialRating: input.officialRating as never,
      difficultyLevel: input.difficultyLevel,
      expertiseRequired: input.expertiseRequired,
      averageSessionMinutes: input.averageSessionMinutes,
      contentNotes: input.contentNotes?.join("|"),
      maxPlayers: input.maxPlayers,
      playerCountLabel: input.playerCountLabel,
      updatedAt: new Date(),
    })
    .where(eq(games.id, gameId));

  if (input.genres || input.platforms) {
    await db.delete(gameTags).where(eq(gameTags.gameId, gameId));

    const genreTags = input.genres
      ? await upsertTags(
          db,
          input.genres.map((slug) => ({
            slug,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            kind: "genre",
          })),
        )
      : [];

    const platformTags = input.platforms
      ? await upsertTags(
          db,
          input.platforms.map((slug) => ({
            slug,
            name: slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            kind: "platform",
          })),
        )
      : [];

    if (genreTags.length + platformTags.length > 0) {
      await db.insert(gameTags).values(
        [...genreTags, ...platformTags].map((tag) => ({
          gameId,
          tagId: tag.id,
        })),
      );
    }
  }

  if (input.playStyles) {
    await db.delete(gamePlayStyles).where(eq(gamePlayStyles.gameId, gameId));
    await db.insert(gamePlayStyles).values(
      input.playStyles.map((playStyle) => ({
        gameId,
        playStyle,
      })),
    );
  }

  const updated = await db.query.games.findFirst({
    where: eq(games.id, gameId),
    with: gameWithRelations,
  });

  return updated ? mapGame(updated) : null;
}

export async function deleteGame(db: Database, gameId: string) {
  const [deleted] = await db
    .delete(games)
    .where(eq(games.id, gameId))
    .returning({ id: games.id });

  return deleted ?? null;
}

export async function toggleFavorite(
  db: Database,
  userId: string,
  gameId: string,
) {
  const game = await db.query.games.findFirst({
    where: eq(games.id, gameId),
  });

  if (!game) {
    return null;
  }

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)),
  });

  if (existing) {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.gameId, gameId)));
    return { favorited: false };
  }

  await db.insert(favorites).values({ userId, gameId });
  return { favorited: true };
}

export async function getPendingCounts(db: Database) {
  const [ageCount, expertiseCount, gameCount] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(ageSuggestions)
      .where(eq(ageSuggestions.status, "pending")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(expertiseSuggestions)
      .where(eq(expertiseSuggestions.status, "pending")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(gameSuggestions)
      .where(eq(gameSuggestions.status, "pending")),
  ]);

  return {
    ageSuggestions: Number(ageCount[0]?.count ?? 0),
    expertiseSuggestions: Number(expertiseCount[0]?.count ?? 0),
    gameSuggestions: Number(gameCount[0]?.count ?? 0),
    total:
      Number(ageCount[0]?.count ?? 0) +
      Number(expertiseCount[0]?.count ?? 0) +
      Number(gameCount[0]?.count ?? 0),
  };
}
