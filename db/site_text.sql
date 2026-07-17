-- ============================================================================
-- site_text: editable website text (bio, buttons, headings, etc.)
-- ============================================================================
-- Each row overrides one piece of text by `key`. No row for a key = the
-- built-in default text shows. Edit values in Table Editor → site_text.
-- Public can read only; edits happen in the dashboard.
-- ============================================================================

create table if not exists public.site_text (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz default now()
);

alter table public.site_text enable row level security;

drop policy if exists "public read site_text" on public.site_text;
create policy "public read site_text"
  on public.site_text for select to anon using (true);

-- Seed the simple text bits with their current wording so they appear in the
-- dashboard ready to edit. (bio and hero_tagline are intentionally NOT seeded:
-- leaving them out keeps the nicely-formatted defaults; add a row for
-- key 'bio' or 'hero_tagline' only when you want to replace them with plain text.)
insert into public.site_text (key, value) values
  ('hero_cta_listen',  'Escuchar Ahora'),
  ('hero_cta_booking', 'Contrataciones'),
  ('stat1_value',      '2007'),
  ('stat1_label',      'Fundada'),
  ('stat2_value',      'Waukegan, IL'),
  ('stat2_label',      'Origen'),
  ('stat3_value',      'Norteña'),
  ('stat3_label',      'Género'),
  ('shows_empty_title','Próximamente'),
  ('shows_empty_text', 'Nuevas fechas en camino — síguenos en redes sociales para no perderte nada.'),
  ('shows_empty_cta',  'Contratar la Banda'),
  ('videos_more',      'Ver Más en YouTube →')
on conflict (key) do nothing;

-- Editable keys and where they appear:
--   bio               -> the "La Banda" bio paragraphs (add row to replace, plain text)
--   hero_tagline      -> hero line "Música Norteña · Waukegan… · Desde 2007"
--   hero_cta_listen   -> hero button "Escuchar Ahora"
--   hero_cta_booking  -> hero button "Contrataciones"
--   stat1_value/label -> 2007 / Fundada
--   stat2_value/label -> Waukegan, IL / Origen
--   stat3_value/label -> Norteña / Género
--   shows_empty_title -> "Próximamente"
--   shows_empty_text  -> the "Nuevas fechas…" line
--   shows_empty_cta   -> button "Contratar la Banda"
--   videos_more       -> button "Ver Más en YouTube →"
