import { config } from "dotenv";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

config({ path: resolve(process.cwd(), "../../.env") });

export default defineConfig({
  test: {
    environment: "node",
  },
});
