-- Fusion of the Arts: initial schema
-- Creates artists, artworks, artwork_images, inquiries, artwork_views
-- with enums, indexes, RLS policies, and updated_at triggers.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type artwork_status as enum ('draft', 'available', 'reserved', 'sold', 'archived');
create type ownership_type as enum ('owned', 'consignment');
create type inquiry_type as enum ('inquiry', 'reserve');
create type inquiry_status as enum ('new', 'contacted', 'closed');

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- artists
-- ---------------------------------------------------------------------------
create table public.artists (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  full_name   text not null,
  bio         text,
  photo_url   text,
  website     text,
  instagram   text,
  email       text,
  phone       text,
  notes       text, -- admin-only, never exposed publicly
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger artists_set_updated_at
  before update on public.artists
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- artworks
-- ---------------------------------------------------------------------------
create table public.artworks (
  id                              uuid primary key default gen_random_uuid(),
  slug                            text not null unique,
  title                           text not null,
  artist_id                       uuid not null references public.artists(id) on delete restrict,
  description                     text,
  medium                          text,
  year_created                    int,
  width_in                        numeric(6, 2),
  height_in                       numeric(6, 2),
  depth_in                        numeric(6, 2),
  weight_lb                       numeric(6, 2),
  price_cents                     int check (price_cents is null or price_cents >= 0),
  sold_price_cents                int check (sold_price_cents is null or sold_price_cents >= 0),
  status                          artwork_status not null default 'draft',
  ownership                       ownership_type not null default 'owned',
  consignment_split_artist_pct    int default 60 check (consignment_split_artist_pct between 0 and 100),
  acquired_at                     date,
  reserved_at                     timestamptz,
  sold_at                         timestamptz,
  created_at                      timestamptz not null default now(),
  updated_at                      timestamptz not null default now()
);

create index artworks_artist_id_idx on public.artworks(artist_id);
create index artworks_status_idx    on public.artworks(status);
create index artworks_sold_at_idx   on public.artworks(sold_at) where sold_at is not null;

create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute procedure public.set_updated_at();

-- ---------------------------------------------------------------------------
-- artwork_images
-- ---------------------------------------------------------------------------
create table public.artwork_images (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references public.artworks(id) on delete cascade,
  storage_path  text not null,
  public_url    text,
  position      int not null default 0,
  alt_text      text,
  is_cover      boolean not null default false,
  created_at    timestamptz not null default now()
);

create index artwork_images_artwork_id_idx on public.artwork_images(artwork_id);
-- Enforce at most one cover image per artwork
create unique index artwork_images_one_cover_per_artwork
  on public.artwork_images(artwork_id)
  where is_cover;

-- ---------------------------------------------------------------------------
-- inquiries
-- ---------------------------------------------------------------------------
create table public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  uuid references public.artworks(id) on delete set null,
  type        inquiry_type not null default 'inquiry',
  name        text not null,
  email       text not null,
  phone       text,
  message     text not null,
  status      inquiry_status not null default 'new',
  created_at  timestamptz not null default now()
);

create index inquiries_artwork_id_idx on public.inquiries(artwork_id);
create index inquiries_status_idx     on public.inquiries(status);

-- ---------------------------------------------------------------------------
-- artwork_views (raw events; aggregated on read)
-- ---------------------------------------------------------------------------
create table public.artwork_views (
  id            uuid primary key default gen_random_uuid(),
  artwork_id    uuid not null references public.artworks(id) on delete cascade,
  session_hash  bytea not null,
  referrer      text,
  viewed_at     timestamptz not null default now()
);

create index artwork_views_artwork_viewed_idx on public.artwork_views(artwork_id, viewed_at);
create index artwork_views_session_idx        on public.artwork_views(artwork_id, session_hash, viewed_at);

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- Admin/server code uses the secret (service_role) key, which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.artists        enable row level security;
alter table public.artworks       enable row level security;
alter table public.artwork_images enable row level security;
alter table public.inquiries      enable row level security;
alter table public.artwork_views  enable row level security;

-- Artists: publicly readable
create policy "artists public read"
  on public.artists for select
  to anon, authenticated
  using (true);

-- Artworks: public sees only available + sold
create policy "artworks public read"
  on public.artworks for select
  to anon, authenticated
  using (status in ('available', 'sold'));

-- Artwork images: visible iff the parent artwork is publicly visible
create policy "artwork_images public read"
  on public.artwork_images for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.artworks a
      where a.id = artwork_images.artwork_id
        and a.status in ('available', 'sold')
    )
  );

-- Inquiries: anyone can submit. No public SELECT (admin-only via service role).
create policy "inquiries public insert"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

-- Views: anyone can record a view. No public SELECT.
create policy "artwork_views public insert"
  on public.artwork_views for insert
  to anon, authenticated
  with check (true);
