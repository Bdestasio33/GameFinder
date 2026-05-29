const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

let authToken: string | null = localStorage.getItem("gamefinder_token");

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem("gamefinder_token", token);
  } else {
    localStorage.removeItem("gamefinder_token");
  }
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export type VideoGame = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  releaseYear: number | null;
  genres: Array<{ slug: string; name: string; kind: string }>;
  platforms: Array<{ slug: string; name: string; kind: string }>;
  minAgeRecommendation: number | null;
  officialRating: string | null;
  difficultyLevel: string;
  expertiseRequired: string;
  playStyles: string[];
  averageSessionMinutes: number | null;
  contentNotes: string[];
  maxPlayers: number | null;
  playerCountLabel: string | null;
};

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: SessionUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, client: "web" }),
    }),
  logout: () =>
    request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: SessionUser }>("/api/auth/me"),
  games: (params: Record<string, string | number | undefined> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request<VideoGame[]>(`/api/games${suffix}`);
  },
  game: (slug: string) => request<VideoGame>(`/api/games/${slug}`),
  filters: () =>
    request<{ genres: Array<{ slug: string; name: string }>; platforms: Array<{ slug: string; name: string }> }>(
      "/api/meta/filters",
    ),
  pendingCounts: () =>
    request<{ total: number }>("/api/meta/pending-counts"),
  submitAgeSuggestion: (gameId: string, payload: object) =>
    request(`/api/games/${gameId}/age-suggestions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitExpertiseSuggestion: (gameId: string, payload: object) =>
    request(`/api/games/${gameId}/expertise-suggestions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  submitGameSuggestion: (payload: object) =>
    request("/api/game-suggestions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  mySuggestions: () =>
    request<{
      ageSuggestions: Array<{ id: string; suggestedMinAge: number; status: string; rationale: string }>;
      expertiseSuggestions: Array<{ id: string; status: string; rationale: string }>;
      gameSuggestions: Array<{ id: string; title: string; status: string }>;
      favorites: Array<{ id: string; title: string; slug: string }>;
    }>("/api/me/suggestions"),
  moderationQueue: () =>
    request<{
      counts: { total: number };
      ageSuggestions: Array<{ id: string; suggestedMinAge: number; rationale: string; game: { title: string } }>;
      expertiseSuggestions: Array<{ id: string; rationale: string; game: { title: string } }>;
      gameSuggestions: Array<{ id: string; title: string; description: string }>;
    }>("/api/moderation/queue"),
  moderateAge: (id: string, payload: object) =>
    request(`/api/moderation/age-suggestions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  moderateExpertise: (id: string, payload: object) =>
    request(`/api/moderation/expertise-suggestions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  moderateGame: (id: string, payload: object) =>
    request(`/api/moderation/game-suggestions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  adminUsers: () =>
    request<Array<{ id: string; email: string; displayName: string; role: string }>>(
      "/api/admin/users",
    ),
  adminCreateGame: (payload: object) =>
    request("/api/admin/games", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  adminUpdateGame: (id: string, payload: object) =>
    request(`/api/admin/games/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  adminDeleteGame: (id: string) =>
    request(`/api/admin/games/${id}`, { method: "DELETE" }),
  favorite: (gameId: string) =>
    request(`/api/games/${gameId}/favorite`, { method: "POST" }),
};
