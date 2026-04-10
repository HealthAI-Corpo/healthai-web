import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: process.env.CI
    ? [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
    : [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
      ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      SKIP_AUTH: "true",
      NEXT_PUBLIC_USE_MOCK: "true",
      // next-auth exige AUTH_SECRET même si auth bypassée
      AUTH_SECRET: process.env.AUTH_SECRET ?? "playwright-local-test-secret",
      ZITADEL_ISSUER: process.env.ZITADEL_ISSUER ?? "https://ci-dummy.zitadel.cloud",
      ZITADEL_CLIENT_ID: process.env.ZITADEL_CLIENT_ID ?? "ci-dummy-client-id",
      ZITADEL_CLIENT_SECRET: process.env.ZITADEL_CLIENT_SECRET ?? "ci-dummy-client-secret",
    },
  },
});
