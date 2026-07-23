import { defineConfig, devices } from "@playwright/test";
import { e2eDataDir } from "./tests/e2e/environment";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const serverCommand = `npm run dev -- --hostname 127.0.0.1 --port ${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./output/playwright/test-results",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    [process.env.CI ? "line" : "list"],
    ["html", { outputFolder: "./output/playwright/report", open: "never" }],
  ],
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: serverCommand,
    url: `${baseURL}/login`,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1",
      STUDENT_SESSION_SECRET: "synthetic-e2e-student-secret-at-least-32-characters",
      COUNSELOR_SESSION_SECRET: "synthetic-e2e-counselor-secret-at-least-32-characters",
      COUNSELOR_ACCESS_CODE: "synthetic-e2e-counselor-code",
      DATA_DIR: e2eDataDir,
      SUPABASE_URL: "",
      SUPABASE_SERVICE_ROLE_KEY: "",
    },
  },
});
