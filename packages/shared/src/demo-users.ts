export const DEMO_USERS = [
  {
    email: "admin@gametest.local",
    password: "admin123",
    role: "admin",
    label: "Admin User",
  },
  {
    email: "moderator@gametest.local",
    password: "mod123",
    role: "moderator",
    label: "Moderator User",
  },
  {
    email: "user@gametest.local",
    password: "user123",
    role: "user",
    label: "Regular User",
  },
  {
    email: "contributor@gametest.local",
    password: "contrib123",
    role: "contributor",
    label: "Contributor User",
  },
] as const;
