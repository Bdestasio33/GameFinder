import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app.js";

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("API integration", () => {
  const { app } = createApp();

  it("lists seeded video games", async () => {
    const response = await request(app).get("/api/games");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("slug");
    expect(response.body[0]).toHaveProperty("genres");
  });

  it("filters games by search query", async () => {
    const response = await request(app).get("/api/games?search=minecraft");
    expect(response.status).toBe(200);
    expect(response.body.every((game: { title: string }) =>
      game.title.toLowerCase().includes("minecraft"),
    )).toBe(true);
  });

  it("logs in demo users and exposes session info", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@gametest.local", password: "user123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    expect(response.body.user.role).toBe("user");

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${response.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("user@gametest.local");
  });

  it("allows users to submit age suggestions", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "user@gametest.local", password: "user123" });

    const games = await request(app).get("/api/games?search=portal");
    const gameId = games.body[0].id;

    const response = await request(app)
      .post(`/api/games/${gameId}/age-suggestions`)
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        suggestedMinAge: 11,
        rationale: "Puzzle focus and light tone feel fine for older kids.",
      });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("pending");
  });

  it("allows moderators to view the moderation queue", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "moderator@gametest.local", password: "mod123" });

    const response = await request(app)
      .get("/api/moderation/queue")
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(response.status).toBe(200);
    expect(response.body.counts).toBeDefined();
  });

  it("allows admins to create and delete games", async () => {
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@gametest.local", password: "admin123" });

    const created = await request(app)
      .post("/api/admin/games")
      .set("Authorization", `Bearer ${login.body.token}`)
      .send({
        title: "Test Game",
        description: "Temporary admin-created catalog entry for integration tests.",
        releaseYear: 2024,
        minAgeRecommendation: 10,
        officialRating: "T",
        difficultyLevel: "moderate",
        expertiseRequired: "intermediate",
        playStyles: ["solo"],
        averageSessionMinutes: 45,
        contentNotes: [],
        genres: ["action"],
        platforms: ["pc"],
        playerCountLabel: "Single player",
      });

    expect(created.status).toBe(201);

    const deleted = await request(app)
      .delete(`/api/admin/games/${created.body.id}`)
      .set("Authorization", `Bearer ${login.body.token}`);

    expect(deleted.status).toBe(200);
  });
});
