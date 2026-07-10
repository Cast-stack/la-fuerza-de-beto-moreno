-- ============================================================================
-- site_images: swappable images for the website (logo, backgrounds, etc.)
-- ============================================================================
-- Each row overrides one image on the site by `key`. If a key has NO row, the
-- original baked-in image is shown. So adding a row = replacing that image.
--
-- Run order to avoid ever showing a broken image:
--   1. Run the CREATE TABLE + policy block below (safe to re-run).
--   2. Create a PUBLIC Storage bucket named `site-images` in the dashboard.
--   3. EITHER upload your real images and use their Storage URLs,
--      OR run the sample INSERTs below (they use working placehold.co images
--      so nothing breaks) and swap the URLs for your real ones later.
-- ============================================================================

-- 1. Table + read-only public access (matches the rest of the site's RLS)
create table if not exists public.site_images (
  key        text primary key,
  url        text not null,
  updated_at timestamptz default now()
);

alter table public.site_images enable row level security;

drop policy if exists "public read site_images" on public.site_images;
create policy "public read site_images"
  on public.site_images
  for select to anon
  using (true);

-- 2. Sample / placeholder rows -----------------------------------------------
-- These point at working placeholder images (visible, obviously "replace me"),
-- so running this will NOT produce broken images. Replace each `url` with your
-- real image URL when ready (e.g. a public URL from the `site-images` bucket:
--   https://eishicgfvsiodhucvxze.supabase.co/storage/v1/object/public/site-images/<file>)
--
-- ON CONFLICT DO UPDATE means re-running this ALWAYS resets these keys back to
-- the placeholder URLs (and refreshes updated_at) — handy for starting over.
-- WARNING: because this overwrites, re-running WILL replace any real URLs you
-- set for these keys. Once your real images are in, don't re-run this block
-- (edit rows in the Table Editor instead).

insert into public.site_images (key, url) values
  ('logo',        'https://placehold.co/240x120/0a0a1a/ff6b35/png?text=Logo'),
  ('hero_bg',     'https://placehold.co/1200x1600/0a0a1a/ff6b35/png?text=Hero+Background'),
  ('hero_cosmic', 'https://placehold.co/1200x1200/0a0a1a/2a2a40/png?text=Cosmic+Layer'),
  ('bio_image',   'https://placehold.co/600x800/0a0a1a/ff6b35/png?text=Bio+Image')
on conflict (key) do update
  set url = excluded.url,
      updated_at = now();

-- Reference: image keys used by the site
--   logo         -> nav + footer logo (same image)
--   hero_bg      -> main hero background (band photo)
--   hero_cosmic  -> faint decorative hero layer (opacity ~0.08)
--   bio_image    -> bio section image (3:4)
-- Band member photos are separate: set `photo_url` on rows in the `members` table.
