import type { RoleSlug } from "@gamefinder/shared";
import { isRoleAllowedForClient } from "@gamefinder/shared";

export type StaffRole = "moderator" | "admin";

export type AppRoute =
  | "catalog"
  | "game-detail"
  | "login"
  | "moderation"
  | "admin";

const STAFF_ROUTES: Record<StaffRole, readonly AppRoute[]> = {
  moderator: ["catalog", "game-detail", "moderation"],
  admin: ["admin"],
};

const STAFF_HOME: Record<StaffRole, string> = {
  moderator: "/moderation",
  admin: "/admin",
};

export type NavItem = {
  to: string;
  label: string;
  showPendingCount?: boolean;
};

const STAFF_NAV: Record<StaffRole, readonly NavItem[]> = {
  moderator: [
    { to: "/", label: "Catalog" },
    { to: "/moderation", label: "Moderation", showPendingCount: true },
  ],
  admin: [{ to: "/admin", label: "Admin" }],
};

export function isStaffRole(
  role: RoleSlug | string | undefined | null,
): role is StaffRole {
  return role === "moderator" || role === "admin";
}

export function getRoleHome(role: RoleSlug | string | undefined | null): string {
  if (!isStaffRole(role)) {
    return "/login";
  }

  return STAFF_HOME[role];
}

export function getNavItems(
  role: RoleSlug | string | undefined | null,
): readonly NavItem[] {
  if (!isStaffRole(role)) {
    return [];
  }

  return STAFF_NAV[role];
}

export function canAccessRoute(
  role: RoleSlug | string,
  route: AppRoute,
): boolean {
  if (!isStaffRole(role)) {
    return false;
  }

  return STAFF_ROUTES[role].includes(route);
}

export function canUseWebClient(
  role: RoleSlug | string | undefined | null,
): boolean {
  if (!role) {
    return false;
  }

  return isRoleAllowedForClient(role, "web");
}
