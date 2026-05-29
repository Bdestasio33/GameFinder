import { describe, expect, it } from "vitest";
import {
  DEMO_USERS,
  MOBILE_CLIENT_ROLES,
  WEB_CLIENT_ROLES,
  getClientRoleError,
  isRoleAllowedForClient,
} from "@gamefinder/shared";

describe("project smoke", () => {
  it("exposes shared demo users and client role helpers", () => {
    expect(DEMO_USERS.length).toBeGreaterThan(0);
    expect(WEB_CLIENT_ROLES).toEqual(["moderator", "admin"]);
    expect(MOBILE_CLIENT_ROLES).toEqual(["user", "contributor"]);
    expect(isRoleAllowedForClient("moderator", "web")).toBe(true);
    expect(isRoleAllowedForClient("user", "mobile")).toBe(true);
    expect(getClientRoleError("web")).toContain("mobile app");
  });
});
