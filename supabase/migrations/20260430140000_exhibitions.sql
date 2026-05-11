-- Exhibitions schema: a show is a curated set of artworks running for a date range.
-- Written idempotently so it's safe to run multiple times.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------
create table if not exists public.exhibitions (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  title          text not null,
  curator        text,
  collaboration  text,
  statement      text,
  hero_image_url text,
  starts_at      date not null,
  ends_at        date not null,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists exhibitions_dates_idx on public.exhibitions(starts_at, ends_at);
create index if not exists exhibitions_published_idx on public.exhibitions(is_published);

drop trigger if exists exhibitions_set_updated_at on public.exhibitions;
create trigger exhibitions_set_updated_at
  before update on public.exhibitions
  for each row execute procedure public.set_updated_at();

create table if not exists public.exhibition_artworks (
  exhibition_id uuid not null references public.exhibitions(id) on delete cascade,
  artwork_id    uuid not null references public.artworks(id) on delete cascade,
  position      int not null default 0,
  added_at      timestamptz not null default now(),
  primary key (exhibition_id, artwork_id)
);

create index if not exists exhibition_artworks_artwork_idx
  on public.exhibition_artworks(artwork_id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.exhibitions enable row level security;
alter table public.exhibition_artworks enable row level security;

drop policy if exists "exhibitions public read" on public.exhibitions;
create policy "exhibitions public read"
  on public.exhibitions for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "exhibition_artworks public read" on public.exhibition_artworks;
create policy "exhibition_artworks public read"
  on public.exhibition_artworks for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.exhibitions e
      where e.id = exhibition_artworks.exhibition_id
        and e.is_published = true
    )
  );

-- ---------------------------------------------------------------------------
-- Seed: Sin Reversa 2 (current show, started 2026-04-18, runs 3 months)
-- ---------------------------------------------------------------------------
insert into public.exhibitions
  (slug, title, curator, collaboration, statement, starts_at, ends_at, is_published)
values
  (
    'sin-reversa-2',
    'Sin Reversa 2',
    'Disem',
    'In collaboration with the artists and curator Disem.',
    'Sin Reversa 2 brings together new and recent work from the gallery''s roster, curated by Disem. Edit this statement in the admin.',
    '2026-04-18',
    '2026-07-18',
    true
  )
on conflict (slug) do nothing;
