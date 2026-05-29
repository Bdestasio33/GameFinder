import { useEffect, useState } from "react";
import { api, type VideoGame } from "../api.js";
import { GameCard } from "../components/GameCard.js";

type FilterOptions = {
  genres: Array<{ slug: string; name: string }>;
  platforms: Array<{ slug: string; name: string }>;
};

export function CatalogPage() {
  const [games, setGames] = useState<VideoGame[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({ genres: [], platforms: [] });
  const [search, setSearch] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [expertise, setExpertise] = useState("");
  const [genre, setGenre] = useState("");
  const [platform, setPlatform] = useState("");
  const [playStyle, setPlayStyle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.filters().then(setFilters).catch(() => undefined);
  }, []);

  useEffect(() => {
    api
      .games({
        search,
        maxAge: maxAge ? Number(maxAge) : undefined,
        difficulty,
        expertise,
        genre,
        platform,
        playStyle,
      })
      .then(setGames)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Failed to load games"),
      );
  }, [search, maxAge, difficulty, expertise, genre, platform, playStyle]);

  return (
    <section>
      <header className="page-header">
        <p className="eyebrow">Video game discovery</p>
        <h1>Find games by age, difficulty, and play style</h1>
        <p className="lede">
          Browse a seeded starter catalog with filters for parents, educators, and players.
        </p>
      </header>

      <div className="filters card">
        <input
          placeholder="Search by title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select value={maxAge} onChange={(event) => setMaxAge(event.target.value)}>
          <option value="">Any age</option>
          {[6, 10, 13, 17].map((age) => (
            <option key={age} value={age}>
              Up to age {age}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
          <option value="">Any difficulty</option>
          {["casual", "moderate", "challenging", "hardcore"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select value={expertise} onChange={(event) => setExpertise(event.target.value)}>
          <option value="">Any expertise</option>
          {["beginner", "casual", "intermediate", "advanced", "expert"].map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select value={genre} onChange={(event) => setGenre(event.target.value)}>
          <option value="">Any genre</option>
          {filters.genres.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
          <option value="">Any platform</option>
          {filters.platforms.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <select value={playStyle} onChange={(event) => setPlayStyle(event.target.value)}>
          <option value="">Any play style</option>
          {[
            "solo",
            "co-op",
            "competitive",
            "online-multiplayer",
            "couch-co-op",
            "story-driven",
            "sandbox",
          ].map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="game-grid">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  );
}
