import { useEffect, useState } from "react";
import { healthResponseSchema } from "@gamefinder/shared";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type GameListItem = {
  id: string;
  title: string;
  description: string | null;
  minPlayers: number;
  maxPlayers: number;
  minPlayTimeMinutes: number | null;
  maxPlayTimeMinutes: number | null;
  publisher: string | null;
  publishedYear: number | null;
  tags: Array<{ slug: string; name: string; kind: string }>;
};

export function App() {
  const [health, setHealth] = useState<string>("checking...");
  const [games, setGames] = useState<GameListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthJson = healthResponseSchema.parse(await healthResponse.json());
        setHealth(`${healthJson.service} (${healthJson.database})`);

        const gamesResponse = await fetch(`${apiUrl}/api/games`);
        setGames((await gamesResponse.json()) as GameListItem[]);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to reach the API",
        );
      }
    }

    void load();
  }, []);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">GameFinder</p>
        <h1>Board game discovery scaffold</h1>
        <p className="lede">
          Turborepo monorepo with API, web, mobile, PostgreSQL, and Drizzle seed
          data.
        </p>
        <p className="status">API status: {health}</p>
      </header>

      {error ? (
        <p className="error">{error}</p>
      ) : (
        <section className="games">
          <h2>Seeded games</h2>
          <ul>
            {games.map((game) => (
              <li key={game.id}>
                <strong>{game.title}</strong>
                <span>
                  {game.minPlayers}-{game.maxPlayers} players
                  {game.minPlayTimeMinutes
                    ? ` · ${game.minPlayTimeMinutes}-${game.maxPlayTimeMinutes ?? game.minPlayTimeMinutes} min`
                    : null}
                </span>
                <p>{game.description}</p>
                <div className="tags">
                  {game.tags.map((tag) => (
                    <span key={tag.slug}>{tag.name}</span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
