import { compare } from "bcryptjs";
import { randomBytes } from "node:crypto";
import type { Database } from "@gamefinder/db";
import { sessions, users } from "@gamefinder/db/schema";
import { eq } from "drizzle-orm";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function loginUser(
  db: Database,
  email: string,
  password: string,
) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
    with: {
      roles: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return null;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessions).values({
    userId: user.id,
    token,
    expiresAt,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.roles[0]?.role.slug ?? "user",
    },
  };
}

export async function logoutUser(db: Database, token: string) {
  await db.delete(sessions).where(eq(sessions.token, token));
}
