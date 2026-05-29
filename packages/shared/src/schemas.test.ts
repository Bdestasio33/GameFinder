import { describe, expect, it } from "vitest";
import { loginSchema, ageSuggestionInputSchema, gameUpsertSchema } from "../src/schemas.js";

describe("schemas", () => {
  it("validates login payloads", () => {
    expect(
      loginSchema.safeParse({
        email: "user@gametest.local",
        password: "user123",
        client: "mobile",
      }).success,
    ).toBe(true);
  });

  it("rejects short age suggestion rationales", () => {
    expect(
      ageSuggestionInputSchema.safeParse({
        suggestedMinAge: 10,
        rationale: "too short",
      }).success,
    ).toBe(false);
  });

  it("requires admin game age recommendations between 1 and 99", () => {
    const basePayload = {
      title: "Test Game",
      description: "A valid admin game description for schema validation.",
      difficultyLevel: "moderate" as const,
      expertiseRequired: "intermediate" as const,
      playStyles: ["solo" as const],
      genres: ["action"],
      platforms: ["pc"],
    };

    expect(
      gameUpsertSchema.safeParse({
        ...basePayload,
        minAgeRecommendation: 10,
      }).success,
    ).toBe(true);

    expect(
      gameUpsertSchema.safeParse({
        ...basePayload,
        minAgeRecommendation: 0,
      }).success,
    ).toBe(false);

    expect(
      gameUpsertSchema.safeParse({
        ...basePayload,
        minAgeRecommendation: 100,
      }).success,
    ).toBe(false);
  });
});
