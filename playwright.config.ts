import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";
import { resolve } from "node:path";

loadEnv({ path: resolve(process.cwd(), ".env") });

const hasDatabase = Boolean(process.env.DATABASE_URL);
const webHost = "127.0.0.1";
const webPort = 5173;
const apiPort = Number(process.env.API_PORT ?? 3001);
const webBaseUrl = `http://${webHost}:${webPort}`;
const apiHealthUrl = `http://${webHost}:${apiPort}/health`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: webBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: hasDatabase
    ? [
        {
          command: "pnpm --filter @gamefinder/api dev",
          url: apiHealthUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
        {
          command: `pnpm --filter @gamefinder/web dev --host ${webHost} --port ${webPort}`,
          url: webBaseUrl,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
        },
      ]
    : {
        command: `pnpm exec turbo build --filter=@gamefinder/web && pnpm --filter @gamefinder/web preview --host ${webHost} --port ${webPort}`,
        url: webBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
