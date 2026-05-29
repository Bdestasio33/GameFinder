import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, type VideoGame } from "../api.js";
import { useAuth, PERMISSIONS } from "../auth/AuthProvider.js";

export function GameDetailPage() {
  const { slug } = useParams();
  const { user, can } = useAuth();
  const [game, setGame] = useState<VideoGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [ageForm, setAgeForm] = useState({ suggestedMinAge: 10, rationale: "" });
  const [expertiseForm, setExpertiseForm] = useState({
    suggestedDifficulty: "moderate",
    suggestedExpertise: "intermediate",
    rationale: "",
  });

  useEffect(() => {
    if (!slug) return;
    api
      .game(slug)
      .then(setGame)
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Failed to load game"),
      );
  }, [slug]);

  async function submitAge(event: FormEvent) {
    event.preventDefault();
    if (!game) return;
    await api.submitAgeSuggestion(game.id, ageForm);
    setMessage("Age suggestion submitted for moderation.");
  }

  async function submitExpertise(event: FormEvent) {
    event.preventDefault();
    if (!game) return;
    await api.submitExpertiseSuggestion(game.id, expertiseForm);
    setMessage("Expertise suggestion submitted for moderation.");
  }

  if (error) return <p className="error">{error}</p>;
  if (!game) return <p>Loading game...</p>;

  return (
    <section className="detail-layout">
      <Link to="/" className="back-link">
        ← Back to catalog
      </Link>
      <article className="card">
        <header className="page-header">
          <h1>{game.title}</h1>
          <p className="meta">
            {game.releaseYear} · {game.officialRating} · Age {game.minAgeRecommendation}+
          </p>
        </header>
        <p>{game.description}</p>
        <dl className="detail-grid">
          <div>
            <dt>Difficulty</dt>
            <dd>{game.difficultyLevel}</dd>
          </div>
          <div>
            <dt>Expertise</dt>
            <dd>{game.expertiseRequired}</dd>
          </div>
          <div>
            <dt>Session length</dt>
            <dd>{game.averageSessionMinutes ?? "?"} min avg</dd>
          </div>
          <div>
            <dt>Players</dt>
            <dd>{game.playerCountLabel ?? "Unknown"}</dd>
          </div>
        </dl>
        <div className="pill-row">
          {game.genres.map((genre) => (
            <span key={genre.slug} className="pill pill-genre">
              {genre.name}
            </span>
          ))}
          {game.platforms.map((platform) => (
            <span key={platform.slug} className="pill pill-platform">
              {platform.name}
            </span>
          ))}
          {game.playStyles.map((style) => (
            <span key={style} className="pill">
              {style}
            </span>
          ))}
        </div>
        {game.contentNotes.length ? (
          <p className="content-notes">
            Content notes: {game.contentNotes.join(", ")}
          </p>
        ) : null}
      </article>

      {message ? <p className="success">{message}</p> : null}

      {user && can(PERMISSIONS.SUBMIT_AGE_SUGGESTION) ? (
        <form className="card form-card" onSubmit={(event) => void submitAge(event)}>
          <h2>Suggest age recommendation</h2>
          <label>
            Minimum age
            <input
              type="number"
              min={0}
              max={21}
              value={ageForm.suggestedMinAge}
              onChange={(event) =>
                setAgeForm({ ...ageForm, suggestedMinAge: Number(event.target.value) })
              }
            />
          </label>
          <label>
            Rationale
            <textarea
              value={ageForm.rationale}
              onChange={(event) =>
                setAgeForm({ ...ageForm, rationale: event.target.value })
              }
              minLength={10}
              required
            />
          </label>
          <button type="submit" className="button-primary">
            Submit age suggestion
          </button>
        </form>
      ) : null}

      {user && can(PERMISSIONS.SUBMIT_EXPERTISE_SUGGESTION) ? (
        <form className="card form-card" onSubmit={(event) => void submitExpertise(event)}>
          <h2>Suggest difficulty / expertise</h2>
          <label>
            Difficulty
            <select
              value={expertiseForm.suggestedDifficulty}
              onChange={(event) =>
                setExpertiseForm({
                  ...expertiseForm,
                  suggestedDifficulty: event.target.value,
                })
              }
            >
              {["casual", "moderate", "challenging", "hardcore"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label>
            Expertise
            <select
              value={expertiseForm.suggestedExpertise}
              onChange={(event) =>
                setExpertiseForm({
                  ...expertiseForm,
                  suggestedExpertise: event.target.value,
                })
              }
            >
              {["beginner", "casual", "intermediate", "advanced", "expert"].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rationale
            <textarea
              value={expertiseForm.rationale}
              onChange={(event) =>
                setExpertiseForm({ ...expertiseForm, rationale: event.target.value })
              }
              minLength={10}
              required
            />
          </label>
          <button type="submit" className="button-primary">
            Submit expertise suggestion
          </button>
        </form>
      ) : null}
    </section>
  );
}
