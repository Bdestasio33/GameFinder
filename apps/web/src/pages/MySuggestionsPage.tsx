import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth, PERMISSIONS } from "../auth/AuthProvider.js";

export function MySuggestionsPage() {
  const { user, can } = useAuth();
  const [data, setData] = useState<{
    ageSuggestions: Array<{ id: string; suggestedMinAge: number; status: string; rationale: string }>;
    expertiseSuggestions: Array<{ id: string; status: string; rationale: string }>;
    gameSuggestions: Array<{ id: string; title: string; status: string }>;
    favorites: Array<{ id: string; title: string; slug: string }>;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    api.mySuggestions().then(setData).catch(() => setData(null));
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!data) return <p>Loading suggestions...</p>;

  return (
    <section>
      <header className="page-header">
        <h1>My suggestions</h1>
      </header>
      <div className="stack">
        <article className="card">
          <h2>Favorites</h2>
          <ul>
            {data.favorites.map((game) => (
              <li key={game.id}>{game.title}</li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2>Age suggestions</h2>
          <ul>
            {data.ageSuggestions.map((item) => (
              <li key={item.id}>
                Age {item.suggestedMinAge} · {item.status} · {item.rationale}
              </li>
            ))}
          </ul>
        </article>
        <article className="card">
          <h2>Expertise suggestions</h2>
          <ul>
            {data.expertiseSuggestions.map((item) => (
              <li key={item.id}>
                {item.status} · {item.rationale}
              </li>
            ))}
          </ul>
        </article>
        {can(PERMISSIONS.SUBMIT_GAME_SUGGESTION) ? (
          <article className="card">
            <h2>Game suggestions</h2>
            <ul>
              {data.gameSuggestions.map((item) => (
                <li key={item.id}>
                  {item.title} · {item.status}
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </div>
    </section>
  );
}
