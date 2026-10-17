import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 120000,
  expect: { timeout: 10000 },
  workers: 1,
  fullyParallel: false,
  reporter: [["list"], ["json", { outputFile: "test-results/browser.json" }]],
  use: {
    baseURL: process.env.LIVE_URL || "http://127.0.0.1:4279",
    trace: "off",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
    { name: "firefox", use: { browserName: "firefox" } },
    { name: "webkit", use: { browserName: "webkit" } },
  ],
  webServer: process.env.LIVE_URL
    ? undefined
    : {
        command: "npm run serve",
        url: "http://127.0.0.1:4279",
        reuseExistingServer: false,
        timeout: 30000,
      },
});
