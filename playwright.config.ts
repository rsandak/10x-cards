import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

// Only load .env.test if it exists
const envPath = path.resolve(process.cwd(), ".env.test");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

export default defineConfig({
  testDir: "./",
  testMatch: ["**/e2e/**/*.spec.ts", "**/tests/e2e/**/*.spec.ts"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run preview",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
