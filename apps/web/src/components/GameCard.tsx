import { Link } from "react-router-dom";
import type { VideoGame } from "../api.js";

export function GameCard({ game }: { game: VideoGame }) {
  return (
    <article className="card game-card">
      <div className="card-header">
        <h2>
          <Link to={`/games/${game.slug}`}>{game.title}</Link>
        </h2>
        <span className="meta">
          {game.releaseYear ?? "Unknown year"} · {game.officialRating ?? "Unrated"}
        </span>
      </div>
      <p>{game.description}</p>
      <div className="pill-row">
        {game.genres.map((genre) => (
          <span key={genre.slug} className="pill pill-genre">
            {genre.name}
          </span>
        ))}
      </div>
      <div className="card-footer">
        <span>Age {game.minAgeRecommendation ?? "?"}+</span>
        <span>{game.difficultyLevel}</span>
        <span>{game.expertiseRequired}</span>
      </div>
    </article>
  );
}
