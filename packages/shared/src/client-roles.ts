import type { RoleSlug } from "./constants.js";

export const WEB_CLIENT_ROLES = ["moderator", "admin"] as const satisfies readonly RoleSlug[];
export const MOBILE_CLIENT_ROLES = ["user", "contributor"] as const satisfies readonly RoleSlug[];

export type WebClientRole = (typeof WEB_CLIENT_ROLES)[number];
export type MobileClientRole = (typeof MOBILE_CLIENT_ROLES)[number];
export type AuthClient = "web" | "mobile";

export function isRoleAllowedForClient(
  role: RoleSlug | string,
  client: AuthClient,
): boolean {
  if (client === "web") {
    return (WEB_CLIENT_ROLES as readonly string[]).includes(role);
  }

  return (MOBILE_CLIENT_ROLES as readonly string[]).includes(role);
}

export function getClientRoleError(client: AuthClient): string {
  return client === "web"
    ? "This account is for the mobile app. Use a moderator or admin account here."
    : "This account is for the web staff portal. Use a user account in the mobile app.";
}
