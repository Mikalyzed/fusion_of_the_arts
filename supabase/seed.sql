-- Fusion of the Arts — development seed data.
-- Run manually once via the Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to re-run: uses ON CONFLICT DO NOTHING on slugs.

-- ---------------------------------------------------------------------------
-- Artists
-- ---------------------------------------------------------------------------
insert into public.artists (slug, full_name, bio, photo_url, website, instagram, email)
values
  (
    'maria-ruiz',
    'María Ruiz',
    'Abstract painter working primarily in large-format oils. Based in San Juan, exhibited internationally.',
    'https://placehold.co/400x400?text=MR',
    'https://example.com/mariaruiz',
    'mariaruiz_art',
    'maria@example.com'
  ),
  -- Intentionally incomplete profile — exercises the "partial data OK" rule
  ('julian-cole', 'Julian Cole', null, null, null, null, null)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Artworks (2 available, 1 sold)
-- ---------------------------------------------------------------------------
insert into public.artworks
  (slug, title, artist_id, description, medium, year_created,
   width_in, height_in, price_cents, status, ownership, acquired_at)
values
  (
    'tidepool-no-3', 'Tidepool No. 3',
    (select id from public.artists where slug = 'maria-ruiz'),
    'Oil on canvas. Part of the Coastal Series exploring tidal textures.',
    'Oil on canvas', 2024,
    48.00, 60.00, 450000, 'available', 'consignment', '2026-02-14'
  ),
  (
    'ascent', 'Ascent',
    (select id from public.artists where slug = 'maria-ruiz'),
    null,
    'Acrylic on canvas', 2025,
    36.00, 48.00, 280000, 'available', 'owned', '2026-03-01'
  ),
  (
    'quiet-harbor', 'Quiet Harbor',
    (select id from public.artists where slug = 'julian-cole'),
    'Mixed media on wood panel.',
    'Mixed media', 2023,
    24.00, 24.00, 180000, 'sold', 'consignment', '2025-11-20'
  )
on conflict (slug) do nothing;

-- Record the sale details for Quiet Harbor
update public.artworks
   set sold_at          = '2026-03-15',
       sold_price_cents = 180000
 where slug = 'quiet-harbor'
   and sold_at is null;

-- ---------------------------------------------------------------------------
-- Placeholder cover images (real uploads happen via Supabase Storage later)
-- ---------------------------------------------------------------------------
insert into public.artwork_images (artwork_id, storage_path, public_url, alt_text, is_cover, position)
select a.id,
       'placeholder/' || a.slug || '.jpg',
       'https://placehold.co/800x1000?text=' || replace(a.title, ' ', '+'),
       a.title,
       true,
       0
  from public.artworks a
 where a.slug in ('tidepool-no-3', 'ascent', 'quiet-harbor')
   and not exists (
     select 1
       from public.artwork_images i
      where i.artwork_id = a.id
        and i.is_cover
   );
