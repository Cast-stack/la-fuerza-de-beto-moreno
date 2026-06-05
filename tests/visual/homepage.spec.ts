import { test, expect } from "@playwright/test";

/**
 * Visual regression suite.
 *
 * Per-viewport snapshots are stored under tests/visual/homepage.spec.ts-snapshots/.
 * To (re)generate baselines after intentional design changes, run:
 *   bunx playwright test --update-snapshots
 */

const sections = [
  { id: "hero", name: "hero" },
  { id: "banda", name: "banda" },
  { id: "musica", name: "musica" },
  { id: "videos", name: "videos" },
  { id: "shows", name: "shows" },
  { id: "contacto", name: "contacto" },
];

test.beforeEach(async ({ page }) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      /* Reveal-on-scroll elements should be visible for snapshots */
      .reveal { opacity: 1 !important; transform: none !important; }
    `,
  });
});

test("homepage full page matches baseline", async ({ page }) => {
  await page.goto("/");
  // Wait for fonts and images
  await page.evaluate(() => (document as any).fonts?.ready);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveScreenshot("homepage-full.png", { fullPage: true });
});

for (const section of sections) {
  test(`section "${section.name}" matches baseline`, async ({ page }) => {
    await page.goto(`/#${section.id}`);
    await page.evaluate(() => (document as any).fonts?.ready);
    await page.waitForLoadState("networkidle");
    const locator = page.locator(`#${section.id}`).first();
    await locator.scrollIntoViewIfNeeded();
    await expect(locator).toHaveScreenshot(`section-${section.name}.png`);
  });
}
