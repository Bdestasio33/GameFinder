import type { Database } from "@gamefinder/db";

type GameRow = Awaited<
  ReturnType<Database["query"]["games"]["findMany"]>
>[number] & {
  tags: Array<{ tag: { slug: string; name: string; kind: string } }>;
  playStyles: Array<{ playStyle: string }>;
};

export function mapGame(game: GameRow) {
  const genres = game.tags
    .filter(({ tag }) => tag.kind === "genre")
    .map(({ tag }) => tag);
  const platforms = game.tags
    .filter(({ tag }) => tag.kind === "platform")
    .map(({ tag }) => tag);

  return {
    id: game.id,
    title: game.title,
    slug: game.slug,
    description: game.description,
    releaseYear: game.releaseYear,
    genres,
    platforms,
    minAgeRecommendation: game.minAgeRecommendation,
    officialRating: game.officialRating,
    difficultyLevel: game.difficultyLevel,
    expertiseRequired: game.expertiseRequired,
    playStyles: game.playStyles.map(({ playStyle }) => playStyle),
    averageSessionMinutes: game.averageSessionMinutes,
    contentNotes: game.contentNotes ? game.contentNotes.split("|") : [],
    maxPlayers: game.maxPlayers,
    playerCountLabel: game.playerCountLabel,
    createdAt: game.createdAt,
    updatedAt: game.updatedAt,
  };
}

export const gameWithRelations = {
  tags: {
    with: {
      tag: true,
    },
  },
  playStyles: true,
} as const;
