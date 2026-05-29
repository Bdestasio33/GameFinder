import { describe, expect, it } from "vitest";
import {
  getClientRoleError,
  isRoleAllowedForClient,
} from "../src/client-roles.js";

describe("client roles", () => {
  it("allows staff roles on web and user roles on mobile", () => {
    expect(isRoleAllowedForClient("moderator", "web")).toBe(true);
    expect(isRoleAllowedForClient("admin", "web")).toBe(true);
    expect(isRoleAllowedForClient("user", "mobile")).toBe(true);
    expect(isRoleAllowedForClient("contributor", "mobile")).toBe(true);
  });

  it("rejects cross-client roles", () => {
    expect(isRoleAllowedForClient("user", "web")).toBe(false);
    expect(isRoleAllowedForClient("contributor", "web")).toBe(false);
    expect(isRoleAllowedForClient("moderator", "mobile")).toBe(false);
    expect(isRoleAllowedForClient("admin", "mobile")).toBe(false);
  });

  it("returns client-specific login errors", () => {
    expect(getClientRoleError("web")).toContain("mobile app");
    expect(getClientRoleError("mobile")).toContain("web staff portal");
  });
});
