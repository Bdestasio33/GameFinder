import { FormEvent, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, type VideoGame } from "../api.js";
import { useAuth, PERMISSIONS } from "../auth/AuthProvider.js";

export function AdminPage() {
  const { can } = useAuth();
  const [games, setGames] = useState<VideoGame[]>([]);
  const [users, setUsers] = useState<Array<{ id: string; email: string; displayName: string; role: string }>>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    releaseYear: 2024,
    minAgeRecommendation: 10,
    officialRating: "T",
    difficultyLevel: "moderate",
    expertiseRequired: "intermediate",
    playStyles: ["solo"],
    averageSessionMinutes: 60,
    contentNotes: [] as string[],
    genres: ["action"],
    platforms: ["pc"],
    playerCountLabel: "Single player",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (can(PERMISSIONS.MANAGE_GAMES)) {
      void api.games().then(setGames);
    }
    if (can(PERMISSIONS.MANAGE_USERS)) {
      void api.adminUsers().then(setUsers);
    }
  }, [can]);

  if (!can(PERMISSIONS.MANAGE_GAMES)) {
    return <Navigate to="/" replace />;
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    await api.adminCreateGame(form);
    setMessage("Game created.");
    setGames(await api.games());
  }

  return (
    <section>
      <header className="page-header">
        <h1>Admin dashboard</h1>
        <p className="lede">Manage catalog entries and review user roles.</p>
      </header>

      <div className="admin-grid">
        <form className="card form-card" onSubmit={(event) => void handleCreate(event)}>
          <h2>Create game</h2>
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
              required
            />
          </label>
          <button type="submit" className="button-primary">
            Create game
          </button>
          {message ? <p className="success">{message}</p> : null}
        </form>

        <article className="card">
          <h2>Catalog ({games.length})</h2>
          <ul>
            {games.map((game) => (
              <li key={game.id} className="admin-row">
                <span>{game.title}</span>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() =>
                    void api.adminDeleteGame(game.id).then(async () => {
                      setGames(await api.games());
                    })
                  }
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </article>

        {can(PERMISSIONS.MANAGE_USERS) ? (
          <article className="card">
            <h2>Users</h2>
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  {user.displayName} · {user.email} · {user.role}
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
}
