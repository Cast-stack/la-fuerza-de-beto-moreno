import { defineConfig, devices } from "@playwright/test";
import fs from "node:fs";

// In Lovable's sandbox, Playwright's default browser download is missing system
// libraries (libglib, etc). A nix-provided browser bundle matching Playwright
// 1.56.x ships with all required libs. If present, point Playwright at it.
const NIX_BROWSERS = "/nix/store/wzfqrpwxk230xqjl1z27h7lis19gjs4f-playwright-browsers";
if (!process.env.PLAYWRIGHT_BROWSERS_PATH && fs.existsSync(NIX_BROWSERS)) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = NIX_BROWSERS;
}

const PORT = Number(process.env.PORT ?? 8080);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
  },
  expect: {
    // Tolerate tiny rendering noise (fonts, antialiasing) across runs
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
      caret: "hide",
    },
  },
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: "bun run dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    { name: "desktop-1920", use: { ...devices["Desktop Chrome"], viewport: { width: 1920, height: 1080 } } },
    { name: "desktop-1366", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 768 } } },
    { name: "laptop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "mobile-414", use: { ...devices["Desktop Chrome"], viewport: { width: 414, height: 896 } } },
    { name: "mobile-390", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
    { name: "mobile-360", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 800 } } },
  ],
});
