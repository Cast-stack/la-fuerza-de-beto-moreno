# Plan — Refit & Replace Page Images

Audit every image and background in `src/routes/index.tsx` + `src/styles/beto-moreno.css` at mobile (360/390/414), tablet (768) and desktop (1280/1920), then refit the ones that are merely sized wrong and replace the ones that don't work compositionally.

## 1. Inventory the current images

Capture screenshots at the 6 target viewports with `.reveal` forced visible (the section content is currently hidden in raw screenshots, masking real issues). For each viewport, record per element:

- **Hero** (`#hero` + `.hero-bg`, `.hero-cosmic`, `.hero-gradient`, `.hero-glow`) — currently an inline base64 JPG with the band photo + "Plaza y Fuerza" logo baked in.
- **Banda section** (`#banda` background video/photo).
- **Música section** — song-art tiles (currently emoji placeholders).
- **Videos section** (`#videos` thumbnails + decorative bg).
- **Shows section** (`#shows` background).
- **Contacto / footer** background.

Output a one-line verdict per element per viewport: `OK | refit | replace`.

## 2. Refit pass (no asset swaps)

Fix the elements marked **refit**:

- Normalize every full-bleed `background-image` to `background-size: cover; background-position: center; background-repeat: no-repeat;` and confirm with a re-screenshot at 360 and 1920.
- Cap hero height on short viewports so the focal subject isn't cropped to a sliver: `min-height: clamp(560px, 100svh, 900px)` and switch hero `background-position` per breakpoint (`center top` desktop, `center` mobile to keep faces in frame).
- Constrain wide hero text/CTAs to a sane column (`max-width: min(640px, 92vw)`) so the headline doesn't push the gradient overlay off-screen on mobile.
- For song-art / video thumbnails, lock aspect ratios (`aspect-ratio: 1/1` for art, `16/9` for video thumbs) and apply `object-fit: cover`.
- Tune the overlay stack (`.hero-cosmic`, `.hero-gradient`, `.hero-glow`) so the photo reads on white-shirt areas without washing it out — adjust opacity, not blend mode.

## 3. Replace pass (asset swaps)

For elements marked **replace** (likely the inline base64 hero — it's a fixed comp baked at one aspect ratio, which is why it looks tiled/awkward on wide screens, and the empty Banda/Shows/Contacto backgrounds):

- Externalize the hero photo via `lovable-assets` (drop the base64, keep the comp as a real JPG) so different `background-position`/art-direction crops are possible without inflating the bundle.
- Where a section has no real background asset yet but the CSS expects one (Banda/Shows), generate or source a band photo + a venue/stage photo, upload via `lovable-assets`, and wire them in as `background-image` with the same cover/center rules.
- Replace emoji song-art with real cover art per single (5 covers, square). If real covers aren't available yet I'll use stylized generated covers matching the fire/cosmic palette and flag them for the user to swap later.

I will ASK before swapping a photo of the actual band members — if the user doesn't want generated stand-ins for real people, I'll only refit and leave those slots as-is.

## 4. Verify

- Re-screenshot all 6 viewports.
- Re-run the existing Playwright snapshot suite with `--update-snapshots` (the baselines under `tests/visual/homepage.spec.ts-snapshots/` will need refreshing once images change — this is expected, not a regression).
- Confirm no new horizontal scroll on 360px.

## Technical notes

- All work stays in `src/routes/index.tsx` + `src/styles/beto-moreno.css` + new `.asset.json` pointers under `src/assets/`.
- No JS/router/data changes.
- Snapshot baselines will be regenerated in the same change set so CI stays green.

## Open question before I start

The hero currently shows photos of the actual band members. For any "replace" candidate involving real people, do you want me to (a) only refit, never swap real-person photos, or (b) generate stylized stand-ins where the existing photo doesn't fit? I'll default to **(a)** unless you say otherwise.
