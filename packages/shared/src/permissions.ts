import type { RoleSlug } from "./constants.js";

export const PERMISSIONS = {
  VIEW_CATALOG: "view_catalog",
  FILTER_GAMES: "filter_games",
  SUBMIT_AGE_SUGGESTION: "submit_age_suggestion",
  SUBMIT_EXPERTISE_SUGGESTION: "submit_expertise_suggestion",
  FAVORITE_GAMES: "favorite_games",
  SUBMIT_GAME_SUGGESTION: "submit_game_suggestion",
  EDIT_OWN_GAME_SUGGESTION: "edit_own_game_suggestion",
  VIEW_MODERATION_QUEUE: "view_moderation_queue",
  MODERATE_SUGGESTIONS: "moderate_suggestions",
  MANAGE_GAMES: "manage_games",
  MANAGE_USERS: "manage_users",
  MANAGE_TAXONOMY: "manage_taxonomy",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<RoleSlug, readonly Permission[]> = {
  guest: [PERMISSIONS.VIEW_CATALOG, PERMISSIONS.FILTER_GAMES],
  user: [
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.FILTER_GAMES,
    PERMISSIONS.SUBMIT_AGE_SUGGESTION,
    PERMISSIONS.SUBMIT_EXPERTISE_SUGGESTION,
    PERMISSIONS.FAVORITE_GAMES,
  ],
  contributor: [
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.FILTER_GAMES,
    PERMISSIONS.SUBMIT_AGE_SUGGESTION,
    PERMISSIONS.SUBMIT_EXPERTISE_SUGGESTION,
    PERMISSIONS.FAVORITE_GAMES,
    PERMISSIONS.SUBMIT_GAME_SUGGESTION,
    PERMISSIONS.EDIT_OWN_GAME_SUGGESTION,
  ],
  moderator: [
    PERMISSIONS.VIEW_CATALOG,
    PERMISSIONS.FILTER_GAMES,
    PERMISSIONS.VIEW_MODERATION_QUEUE,
    PERMISSIONS.MODERATE_SUGGESTIONS,
  ],
  admin: Object.values(PERMISSIONS),
};

export function getPermissionsForRole(role: RoleSlug): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function hasPermission(
  role: RoleSlug,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function hasAnyPermission(
  role: RoleSlug,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function roleAtLeast(
  role: RoleSlug,
  minimumRole: RoleSlug,
): boolean {
  const order: RoleSlug[] = [
    "guest",
    "user",
    "contributor",
    "moderator",
    "admin",
  ];
  return order.indexOf(role) >= order.indexOf(minimumRole);
}
