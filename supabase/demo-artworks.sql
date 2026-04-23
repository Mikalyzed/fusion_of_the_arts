-- Fusion of the Arts — swap demo seed for real example pieces.
-- Run once in Supabase Dashboard → SQL Editor → New query.
-- This WIPES all artworks, artists, and images (safe during dev only).

-- ---------------------------------------------------------------------------
-- 1. Wipe existing rows
-- ---------------------------------------------------------------------------
delete from public.artwork_images;
delete from public.artworks;
delete from public.artists;

-- ---------------------------------------------------------------------------
-- 2. Artists
-- NOTE: placeholder names where unknown. Update via admin once it's built,
-- or re-run an UPDATE statement.
-- ---------------------------------------------------------------------------
insert into public.artists (slug, full_name, bio) values
  (
    'studio-mikalyzed',
    'Studio Mikalyzed',
    'Contemporary sculptor working in lacquered resin. Pop-art sensibility, low-poly geometric forms.'
  ),
  (
    'falbopapir',
    'Falbopapir',
    'Mixed-media artist working in street-art and graffiti aesthetics. Layered text, bright color, bold subjects.'
  );

-- ---------------------------------------------------------------------------
-- 3. Artworks
-- ---------------------------------------------------------------------------
insert into public.artworks
  (slug, title, artist_id, description, medium, year_created,
   width_in, height_in, depth_in, price_cents, status, ownership, acquired_at)
values
  (
    'heavyweight',
    'Heavyweight',
    (select id from public.artists where slug = 'studio-mikalyzed'),
    'Life-size lacquered resin sculpture of a boxing gorilla in a roar pose. Gold polygonal body, glossy red gloves, Everlast trunks. One-of-a-kind statement piece.',
    'Lacquered resin sculpture',
    2024,
    36.00, 60.00, 24.00,
    1250000,
    'available',
    'owned',
    '2026-03-01'
  ),
  (
    'koldt-paa-toppen',
    'Der er koldt på toppen',
    (select id from public.artists where slug = 'falbopapir'),
    'Mixed media on canvas. A vintage Porsche 911 rendered in soft sage and mint, surrounded by layered graffiti text and marginalia. The title — Danish for "it''s cold at the top" — reads across the foreground in bold orange.',
    'Mixed media on canvas',
    2026,
    60.00, 48.00, null,
    850000,
    'available',
    'consignment',
    '2026-04-01'
  );

-- ---------------------------------------------------------------------------
-- 4. Cover images (point at files in public/artworks/*.jpg)
-- ---------------------------------------------------------------------------
insert into public.artwork_images (artwork_id, storage_path, public_url, alt_text, is_cover, position)
values
  (
    (select id from public.artworks where slug = 'heavyweight'),
    'local/heavyweight.jpg',
    '/artworks/gold-gorilla.jpg',
    'Gold lacquered resin sculpture of a boxing gorilla with red gloves',
    true,
    0
  ),
  (
    (select id from public.artworks where slug = 'koldt-paa-toppen'),
    'local/koldt-paa-toppen.jpg',
    '/artworks/koldt-paa-toppen.jpg',
    'Mixed-media painting of a green Porsche 911 with graffiti text',
    true,
    0
  );
