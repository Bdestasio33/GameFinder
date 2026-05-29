import { test, expect } from "@playwright/test";

test.describe("web staff portal smoke", () => {
  test("shows the staff login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByTestId("staff-login-heading")).toBeVisible();
    await expect(page.getByTestId("staff-demo-accounts")).toBeVisible();
    await expect(page.getByText("moderator@gametest.local")).toBeVisible();
    await expect(page.getByText("user@gametest.local")).not.toBeVisible();
  });

  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("staff-login-heading")).toBeVisible();
  });
});

test.describe("web staff auth smoke", () => {
  test.skip(
    !process.env.DATABASE_URL,
    "requires DATABASE_URL, Postgres, and seeded demo users",
  );

  test("moderator can sign in and open the moderation queue", async ({ page }) => {
    await page.goto("/login");

    await page.getByLabel("Email").fill("moderator@gametest.local");
    await page.getByLabel("Password").fill("mod123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/moderation$/);
    await expect(page.getByRole("heading", { name: "Moderation queue" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Moderation/ })).toBeVisible();
  });
});
