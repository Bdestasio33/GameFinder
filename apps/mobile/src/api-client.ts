import { DEMO_USERS } from "@gamefinder/shared";
import { getApiUrl } from "./api-url";

const API_URL = getApiUrl();

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export async function login(
  email: string,
  password: string,
): Promise<{ token: string; user: SessionUser }> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid email or password");
  }

  return response.json() as Promise<{ token: string; user: SessionUser }>;
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export { API_URL };
