import { describe, expect, it } from "vitest";
import { loginSchema, ageSuggestionInputSchema } from "../src/schemas.js";

describe("schemas", () => {
  it("validates login payloads", () => {
    expect(
      loginSchema.safeParse({
        email: "user@gametest.local",
        password: "user123",
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
});
