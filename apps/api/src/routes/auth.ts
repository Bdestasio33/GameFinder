import { Router, type Router as RouterType } from "express";
import type { Database } from "@gamefinder/db";
import { loginSchema, sessionUserSchema } from "@gamefinder/shared";
import {
  type AuthenticatedRequest,
} from "../middleware/auth.js";
import { loginUser, logoutUser } from "../services/auth.js";

export function createAuthRouter(db: Database): RouterType {
  const router = Router();

  router.post("/login", async (request, response) => {
    const body = loginSchema.safeParse(request.body);
    if (!body.success) {
      response.status(400).json({ error: "Invalid login payload" });
      return;
    }

    const result = await loginUser(db, body.data.email, body.data.password);
    if (!result) {
      response.status(401).json({ error: "Invalid email or password" });
      return;
    }

    response.json({
      token: result.token,
      user: sessionUserSchema.parse(result.user),
    });
  });

  router.post("/logout", async (request, response) => {
    const authRequest = request as AuthenticatedRequest;
    const header = authRequest.headers.authorization;
    const token = header?.startsWith("Bearer ")
      ? header.slice("Bearer ".length)
      : undefined;

    if (token) {
      await logoutUser(db, token);
    }

    response.json({ ok: true });
  });

  router.get("/me", async (request, response) => {
    const authRequest = request as AuthenticatedRequest;
    if (!authRequest.user) {
      response.status(401).json({ error: "Not authenticated" });
      return;
    }

    response.json({ user: sessionUserSchema.parse(authRequest.user) });
  });

  return router;
}
