import { createClient } from "@/lib/supabase/server";

export type ArtworkImage = {
  public_url: string | null;
  alt_text: string | null;
  is_cover: boolean;
  position: number;
};

export type ArtistSummary = {
  id: string;
  slug: string;
  full_name: string;
};

export type PublicStatus = "available" | "sold";

export type ArtworkCardData = {
  id: string;
  slug: string;
  title: string;
  artist: ArtistSummary;
  price_cents: number | null;
  status: PublicStatus;
  cover: ArtworkImage | null;
};

export type ArtworkDetail = ArtworkCardData & {
  description: string | null;
  medium: string | null;
  year_created: number | null;
  width_in: number | null;
  height_in: number | null;
  depth_in: number | null;
  sold_at: string | null;
  sold_price_cents: number | null;
  images: ArtworkImage[];
};

export type ArtistListItem = {
  id: string;
  slug: string;
  full_name: string;
  photo_url: string | null;
  bio: string | null;
};

export type ArtistDetail = {
  id: string;
  slug: string;
  full_name: string;
  bio: string | null;
  photo_url: string | null;
  website: string | null;
  instagram: string | null;
  artworks: Array<{
    id: string;
    slug: string;
    title: string;
    price_cents: number | null;
    status: PublicStatus;
    cover: ArtworkImage | null;
  }>;
};

function pickCover(images: ArtworkImage[] | null | undefined): ArtworkImage | null {
  if (!images || images.length === 0) return null;
  const cover = images.find((i) => i.is_cover);
  if (cover) return cover;
  return [...images].sort((a, b) => a.position - b.position)[0];
}

const CARD_SELECT = `
  id, slug, title, price_cents, status,
  artist:artists!inner(id, slug, full_name),
  artwork_images(public_url, alt_text, is_cover, position)
`;

export async function getArtworks(status: PublicStatus): Promise<ArtworkCardData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(CARD_SELECT)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    artist: row.artist as ArtistSummary,
    price_cents: (row.price_cents as number | null) ?? null,
    status: row.status as PublicStatus,
    cover: pickCover(row.artwork_images as ArtworkImage[]),
  }));
}

export async function getArtworkBySlug(slug: string): Promise<ArtworkDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(
      `
      id, slug, title, description, medium, year_created,
      width_in, height_in, depth_in,
      price_cents, sold_price_cents, status, sold_at,
      artist:artists!inner(id, slug, full_name),
      artwork_images(public_url, alt_text, is_cover, position)
      `,
    )
    .eq("slug", slug)
    .in("status", ["available", "sold"])
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const images = (row.artwork_images as ArtworkImage[]) ?? [];
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    medium: (row.medium as string | null) ?? null,
    year_created: (row.year_created as number | null) ?? null,
    width_in: (row.width_in as number | null) ?? null,
    height_in: (row.height_in as number | null) ?? null,
    depth_in: (row.depth_in as number | null) ?? null,
    price_cents: (row.price_cents as number | null) ?? null,
    sold_price_cents: (row.sold_price_cents as number | null) ?? null,
    status: row.status as PublicStatus,
    sold_at: (row.sold_at as string | null) ?? null,
    artist: row.artist as ArtistSummary,
    cover: pickCover(images),
    images: [...images].sort((a, b) => a.position - b.position),
  };
}

export async function getArtists(): Promise<ArtistListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .select("id, slug, full_name, photo_url, bio")
    .order("full_name", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ArtistListItem[];
}

export async function getArtistBySlug(slug: string): Promise<ArtistDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("artists")
    .select(
      `
      id, slug, full_name, bio, photo_url, website, instagram,
      artworks(
        id, slug, title, price_cents, status, sold_at,
        artwork_images(public_url, alt_text, is_cover, position)
      )
      `,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Record<string, unknown>;
  const rawArtworks = (row.artworks as Array<Record<string, unknown>>) ?? [];
  const artworks = rawArtworks
    .filter((a) => a.status === "available" || a.status === "sold")
    .map((a) => ({
      id: a.id as string,
      slug: a.slug as string,
      title: a.title as string,
      price_cents: (a.price_cents as number | null) ?? null,
      status: a.status as PublicStatus,
      cover: pickCover(a.artwork_images as ArtworkImage[]),
    }));

  return {
    id: row.id as string,
    slug: row.slug as string,
    full_name: row.full_name as string,
    bio: (row.bio as string | null) ?? null,
    photo_url: (row.photo_url as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    instagram: (row.instagram as string | null) ?? null,
    artworks,
  };
}
