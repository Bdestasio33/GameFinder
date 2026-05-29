import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, PERMISSIONS } from "../auth/AuthProvider.js";

export function SubmitGamePage() {
  const { can } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    releaseYear: 2020,
    genres: "action",
    platforms: "pc",
  });
  const [message, setMessage] = useState<string | null>(null);

  if (!can(PERMISSIONS.SUBMIT_GAME_SUGGESTION)) {
    return <Navigate to="/login" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await api.submitGameSuggestion({
      title: form.title,
      description: form.description,
      releaseYear: form.releaseYear,
      genres: form.genres.split(",").map((value) => value.trim()),
      platforms: form.platforms.split(",").map((value) => value.trim()),
    });
    setMessage("Game suggestion submitted for moderation.");
  }

  return (
    <section className="narrow card form-card">
      <h1>Submit a new game</h1>
      <form onSubmit={(event) => void handleSubmit(event)}>
        <label>
          Title
          <input
            value={form.title}
            onChange={(event) => setForm({ ...form, title: event.target.value })}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            minLength={10}
            required
          />
        </label>
        <label>
          Release year
          <input
            type="number"
            value={form.releaseYear}
            onChange={(event) =>
              setForm({ ...form, releaseYear: Number(event.target.value) })
            }
          />
        </label>
        <label>
          Genres (comma separated slugs)
          <input
            value={form.genres}
            onChange={(event) => setForm({ ...form, genres: event.target.value })}
          />
        </label>
        <label>
          Platforms (comma separated slugs)
          <input
            value={form.platforms}
            onChange={(event) =>
              setForm({ ...form, platforms: event.target.value })
            }
          />
        </label>
        <button type="submit" className="button-primary">
          Submit game suggestion
        </button>
      </form>
      {message ? <p className="success">{message}</p> : null}
    </section>
  );
}
