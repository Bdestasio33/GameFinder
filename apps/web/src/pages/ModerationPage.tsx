import { useEffect, useState } from "react";
import { api } from "../api.js";

export function ModerationPage() {
  const [queue, setQueue] = useState<{
    counts: { total: number };
    ageSuggestions: Array<{ id: string; suggestedMinAge: number; rationale: string; game: { title: string } }>;
    expertiseSuggestions: Array<{ id: string; rationale: string; game: { title: string } }>;
    gameSuggestions: Array<{ id: string; title: string; description: string }>;
  } | null>(null);

  async function refresh() {
    setQueue(await api.moderationQueue());
  }

  useEffect(() => {
    void refresh();
  }, []);

  if (!queue) return <p>Loading moderation queue...</p>;

  return (
    <section>
      <header className="page-header">
        <h1>Moderation queue</h1>
        <p className="lede">{queue.counts.total} pending items</p>
      </header>
      <div className="stack">
        {queue.ageSuggestions.map((item) => (
          <article key={item.id} className="card">
            <h2>
              Age suggestion · {item.game.title} · age {item.suggestedMinAge}
            </h2>
            <p>{item.rationale}</p>
            <div className="button-row">
              <button
                type="button"
                className="button-primary"
                onClick={() =>
                  void api
                    .moderateAge(item.id, { status: "approved" })
                    .then(refresh)
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  void api
                    .moderateAge(item.id, { status: "rejected" })
                    .then(refresh)
                }
              >
                Reject
              </button>
            </div>
          </article>
        ))}
        {queue.expertiseSuggestions.map((item) => (
          <article key={item.id} className="card">
            <h2>Expertise suggestion · {item.game.title}</h2>
            <p>{item.rationale}</p>
            <div className="button-row">
              <button
                type="button"
                className="button-primary"
                onClick={() =>
                  void api
                    .moderateExpertise(item.id, { status: "approved" })
                    .then(refresh)
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  void api
                    .moderateExpertise(item.id, { status: "rejected" })
                    .then(refresh)
                }
              >
                Reject
              </button>
            </div>
          </article>
        ))}
        {queue.gameSuggestions.map((item) => (
          <article key={item.id} className="card">
            <h2>Game suggestion · {item.title}</h2>
            <p>{item.description}</p>
            <div className="button-row">
              <button
                type="button"
                className="button-primary"
                onClick={() =>
                  void api
                    .moderateGame(item.id, { status: "approved" })
                    .then(refresh)
                }
              >
                Approve
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() =>
                  void api
                    .moderateGame(item.id, { status: "rejected" })
                    .then(refresh)
                }
              >
                Reject
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
