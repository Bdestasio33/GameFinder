import type { Permission, RoleSlug } from "@gamefinder/shared";
import { hasPermission } from "@gamefinder/shared";
import type { Database } from "@gamefinder/db";
import { sessions } from "@gamefinder/db/schema";
import { eq } from "drizzle-orm";
import type { Request, Response, NextFunction } from "express";

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    email: string;
    displayName: string;
    role: RoleSlug;
  };
};

export async function loadSessionUser(
  db: Database,
  token: string | undefined,
) {
  if (!token) {
    return null;
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.token, token),
    with: {
      user: {
        with: {
          roles: {
            with: {
              role: true,
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const primaryRole = session.user.roles[0]?.role.slug ?? "user";

  return {
    id: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName,
    role: primaryRole as RoleSlug,
  };
}

export function createAuthMiddleware(db: Database) {
  return async (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ) => {
    const header = request.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;

    const user = await loadSessionUser(db, token);
    if (user) {
      request.user = user;
    }

    next();
  };
}

export function requireAuth(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  if (!request.user) {
    response.status(401).json({ error: "Authentication required" });
    return;
  }

  next();
}

export function requirePermission(permission: Permission) {
  return (
    request: AuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    if (!request.user) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }

    if (!hasPermission(request.user.role, permission)) {
      response.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}
