import { describe, expect, it } from "vitest";
import {
  hasPermission,
  PERMISSIONS,
  roleAtLeast,
} from "../src/permissions.js";

describe("permissions", () => {
  it("allows guests to browse the catalog", () => {
    expect(hasPermission("guest", PERMISSIONS.VIEW_CATALOG)).toBe(true);
    expect(hasPermission("guest", PERMISSIONS.SUBMIT_AGE_SUGGESTION)).toBe(
      false,
    );
  });

  it("allows users to submit suggestions", () => {
    expect(hasPermission("user", PERMISSIONS.SUBMIT_AGE_SUGGESTION)).toBe(true);
    expect(hasPermission("user", PERMISSIONS.SUBMIT_GAME_SUGGESTION)).toBe(
      false,
    );
  });

  it("allows contributors to submit new games", () => {
    expect(
      hasPermission("contributor", PERMISSIONS.SUBMIT_GAME_SUGGESTION),
    ).toBe(true);
  });

  it("allows moderators to review the queue", () => {
    expect(
      hasPermission("moderator", PERMISSIONS.VIEW_MODERATION_QUEUE),
    ).toBe(true);
    expect(hasPermission("moderator", PERMISSIONS.MANAGE_GAMES)).toBe(false);
  });

  it("allows admins to manage games and users", () => {
    expect(hasPermission("admin", PERMISSIONS.MANAGE_GAMES)).toBe(true);
    expect(hasPermission("admin", PERMISSIONS.MANAGE_USERS)).toBe(true);
  });

  it("compares role hierarchy", () => {
    expect(roleAtLeast("moderator", "contributor")).toBe(true);
    expect(roleAtLeast("user", "moderator")).toBe(false);
  });
});
