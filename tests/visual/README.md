# Visual Regression Tests

Playwright-based visual regression suite that snapshots the homepage across common viewports and compares the hero against the original design comp.

## Viewports covered

| Project | Size | Use case |
|---|---|---|
| desktop-1920 | 1920×1080 | Large desktop |
| desktop-1366 | 1366×768 | Standard desktop |
| laptop-1280 | 1280×800 | Small laptop |
| tablet-768 | 768×1024 | iPad portrait |
| mobile-414 | 414×896 | iPhone Plus |
| mobile-390 | 390×844 | iPhone 13/14 |
| mobile-360 | 360×800 | Android |

## Commands

```bash
# Run all visual tests (starts dev server automatically)
bunx playwright test

# Run a single viewport
bunx playwright test --project=mobile-390

# Update baselines after intentional design changes
bunx playwright test --update-snapshots

# Open HTML report (incl. diff images on failure)
bunx playwright show-report
```

## How it works

- `tests/visual/homepage.spec.ts` — snapshots full page + each section (`#hero`, `#banda`, `#musica`, `#videos`, `#shows`, `#contacto`). On first run, baselines are written under `tests/visual/homepage.spec.ts-snapshots/`; subsequent runs diff against those. Animations and reveal-on-scroll opacity are disabled in test mode so screenshots are deterministic.
- `tests/visual/reference-comparison.spec.ts` — compares the rendered hero against `tests/visual/reference/La_Fuerza_DBM_no_logo.jpg` (the original design comp) using `pixelmatch`. Runs only on `desktop-1920`. Tolerance is intentionally generous (≤45% diff) — this guards against catastrophic regressions, not pixel parity.
- Baselines belong in git so CI can detect drift.
