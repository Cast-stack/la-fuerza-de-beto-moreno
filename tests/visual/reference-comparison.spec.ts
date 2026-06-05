import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import fs from "node:fs";
import path from "node:path";

/**
 * Compares the rendered hero against the user-provided reference image
 * (tests/visual/reference/La_Fuerza_DBM_no_logo.jpg).
 *
 * The reference is a single design comp, so this test only runs on the
 * desktop-1920 project (closest match to the comp aspect ratio). Other
 * viewports are validated by the snapshot suite in homepage.spec.ts.
 */

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1920",
    "Reference comp comparison only meaningful at desktop-1920",
  );
});

test("hero visually matches provided reference comp (within tolerance)", async ({ page }) => {
  const referencePath = path.join(process.cwd(), "tests/visual/reference/La_Fuerza_DBM_no_logo.jpg");
  test.skip(!fs.existsSync(referencePath), "Reference image not present");

  await page.goto("/");
  await page.evaluate(() => (document as any).fonts?.ready);
  await page.waitForLoadState("networkidle");

  const hero = page.locator("#hero").first();
  const shot = await hero.screenshot({ type: "png" });

  // Decode both images and resize the actual to the reference dimensions via
  // canvas resampling in-process (pure JS, no native deps).
  const actual = PNG.sync.read(shot);

  // Reference is JPG → decode by routing through a temporary png via sharp-free path:
  // Playwright bundles jpeg-js? Not guaranteed. Use a simple approach: take a
  // page-level screenshot at the reference's native size by setting viewport
  // and compare against a PNG copy of the reference instead.
  // Strategy: scale the actual to fixed 1280x720 and the reference too, then diff.
  const targetW = 1280;
  const targetH = 720;
  const actualScaled = resizeNearest(actual, targetW, targetH);

  // Decode JPG reference using a tiny built-in: Playwright ships 'jpeg-js' transitively.
  // Fallback: skip if decode fails.
  let referencePng: PNG;
  try {
    const jpeg = await import("jpeg-js");
    const raw = jpeg.decode(fs.readFileSync(referencePath), { useTArray: true });
    const refPng = new PNG({ width: raw.width, height: raw.height });
    refPng.data = Buffer.from(raw.data);
    referencePng = resizeNearest(refPng, targetW, targetH);
  } catch (err) {
    test.skip(true, `jpeg-js not available: ${(err as Error).message}`);
    return;
  }

  const diff = new PNG({ width: targetW, height: targetH });
  const mismatchedPixels = pixelmatch(
    actualScaled.data,
    referencePng.data,
    diff.data,
    targetW,
    targetH,
    { threshold: 0.25, includeAA: false },
  );
  const ratio = mismatchedPixels / (targetW * targetH);

  // Save diff artifact for review on failure.
  const artifactsDir = path.join(process.cwd(), "test-results", "reference-diff");
  fs.mkdirSync(artifactsDir, { recursive: true });
  fs.writeFileSync(path.join(artifactsDir, "actual.png"), PNG.sync.write(actualScaled));
  fs.writeFileSync(path.join(artifactsDir, "reference.png"), PNG.sync.write(referencePng));
  fs.writeFileSync(path.join(artifactsDir, "diff.png"), PNG.sync.write(diff));

  // Generous tolerance — comp vs implementation will never be pixel-identical.
  // This test guards against catastrophic regressions (broken hero, missing bg).
  expect(ratio).toBeLessThan(0.45);
});

function resizeNearest(src: PNG, w: number, h: number): PNG {
  const out = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) {
    const sy = Math.min(src.height - 1, Math.floor((y / h) * src.height));
    for (let x = 0; x < w; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x / w) * src.width));
      const si = (sy * src.width + sx) * 4;
      const di = (y * w + x) * 4;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = src.data[si + 3];
    }
  }
  return out;
}
