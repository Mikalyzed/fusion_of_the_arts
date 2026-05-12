"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/slug";

function field(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

function num(formData: FormData, key: string): number | null {
  const s = field(formData, key);
  if (s == null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function priceCents(formData: FormData, key: string): number | null {
  const s = field(formData, key);
  if (s == null) return null;
  const n = Number(s.replace(/[$,]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

async function uniqueArtworkSlug(
  supabase: ReturnType<typeof createAdminClient>,
  base: string,
  ignoreId?: string,
) {
  let candidate = base;
  let i = 2;
  for (let tries = 0; tries < 50; tries++) {
    const query = supabase.from("artworks").select("id").eq("slug", candidate);
    const { data } = ignoreId
      ? await query.neq("id", ignoreId).maybeSingle()
      : await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  throw new Error(`Could not find unique slug for ${base}`);
}

async function uniqueArtistSlug(
  supabase: ReturnType<typeof createAdminClient>,
  base: string,
) {
  let candidate = base;
  let i = 2;
  for (let tries = 0; tries < 50; tries++) {
    const { data } = await supabase
      .from("artists")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  throw new Error(`Could not find unique slug for ${base}`);
}

// If a new artist name was supplied, create the artist and return its id.
// Otherwise, return the selected artist_id. Throws if neither is provided.
async function resolveArtistId(
  supabase: ReturnType<typeof createAdminClient>,
  formData: FormData,
): Promise<string> {
  const newName = field(formData, "new_artist_name");
  if (newName) {
    const slug = await uniqueArtistSlug(supabase, slugify(newName));
    const { data, error } = await supabase
      .from("artists")
      .insert({ slug, full_name: newName })
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/admin/artists");
    revalidatePath("/artists");
    return data.id;
  }
  const id = field(formData, "artist_id");
  if (!id) throw new Error("Pick an artist or type a new name");
  return id;
}

const STATUS_VALUES = ["draft", "available", "reserved", "sold", "archived"] as const;
const OWNERSHIP_VALUES = ["owned", "consignment"] as const;

function readStatus(formData: FormData, fallback: (typeof STATUS_VALUES)[number] = "draft") {
  const v = field(formData, "status");
  return STATUS_VALUES.includes(v as (typeof STATUS_VALUES)[number])
    ? (v as (typeof STATUS_VALUES)[number])
    : fallback;
}

function readOwnership(formData: FormData) {
  const v = field(formData, "ownership");
  if (!OWNERSHIP_VALUES.includes(v as (typeof OWNERSHIP_VALUES)[number])) {
    throw new Error("Pick an ownership: Owned or Consignment");
  }
  return v as (typeof OWNERSHIP_VALUES)[number];
}

function readDate(formData: FormData, key: string): string | null {
  const v = field(formData, key);
  return v ?? null;
}

export async function createArtwork(formData: FormData) {
  const supabase = createAdminClient();

  const title = field(formData, "title");
  if (!title) throw new Error("Title is required");
  const artistId = await resolveArtistId(supabase, formData);

  const baseSlug = field(formData, "slug") ?? slugify(title);
  const slug = await uniqueArtworkSlug(supabase, baseSlug);

  const status = readStatus(formData, "draft");
  const sold_at =
    status === "sold" ? readDate(formData, "sold_at") ?? new Date().toISOString() : null;

  const { data: artwork, error } = await supabase
    .from("artworks")
    .insert({
      slug,
      title,
      artist_id: artistId,
      description: field(formData, "description"),
      medium: field(formData, "medium"),
      year_created: num(formData, "year_created"),
      width_in: num(formData, "width_in"),
      height_in: num(formData, "height_in"),
      depth_in: num(formData, "depth_in"),
      price_cents: priceCents(formData, "price"),
      sold_price_cents: priceCents(formData, "sold_price"),
      status,
      ownership: readOwnership(formData),
      consignment_split_artist_pct: num(formData, "consignment_split_artist_pct"),
      acquired_at: readDate(formData, "acquired_at"),
      sold_at,
    })
    .select("id")
    .single();
  if (error) throw error;

  // Optional cover image URL
  const coverUrl = field(formData, "cover_url");
  if (coverUrl) {
    const { error: imgErr } = await supabase.from("artwork_images").insert({
      artwork_id: artwork.id,
      storage_path: `manual/${coverUrl}`,
      public_url: coverUrl,
      alt_text: title,
      is_cover: true,
      position: 0,
    });
    if (imgErr) throw imgErr;
  }

  // Auto-attach to the currently running exhibition, if any.
  const today = new Date().toISOString().slice(0, 10);
  const { data: currentEx } = await supabase
    .from("exhibitions")
    .select("id, slug")
    .lte("starts_at", today)
    .gte("ends_at", today)
    .eq("is_published", true)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (currentEx) {
    await supabase
      .from("exhibition_artworks")
      .upsert(
        { exhibition_id: currentEx.id, artwork_id: artwork.id, position: 0 },
        { onConflict: "exhibition_id,artwork_id" },
      );
    revalidatePath(`/exhibitions/${currentEx.slug}`);
  }

  revalidatePath("/admin/artworks");
  revalidatePath("/art");
  revalidatePath("/sold");
  redirect(`/admin/artworks/${artwork.id}`);
}

export async function updateArtwork(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const title = field(formData, "title");
  if (!title) throw new Error("Title is required");
  const artistId = await resolveArtistId(supabase, formData);

  const submittedSlug = field(formData, "slug");
  const baseSlug = submittedSlug ?? slugify(title);
  const slug = await uniqueArtworkSlug(supabase, baseSlug, id);

  // Read previous status to know if we're transitioning to sold
  const { data: previous } = await supabase
    .from("artworks")
    .select("status, sold_at")
    .eq("id", id)
    .maybeSingle();

  const status = readStatus(formData, previous?.status ?? "draft");
  let sold_at: string | null = previous?.sold_at ?? null;
  if (status === "sold" && !sold_at) {
    sold_at = readDate(formData, "sold_at") ?? new Date().toISOString();
  }
  if (status !== "sold") {
    sold_at = null;
  }

  const { error } = await supabase
    .from("artworks")
    .update({
      slug,
      title,
      artist_id: artistId,
      description: field(formData, "description"),
      medium: field(formData, "medium"),
      year_created: num(formData, "year_created"),
      width_in: num(formData, "width_in"),
      height_in: num(formData, "height_in"),
      depth_in: num(formData, "depth_in"),
      price_cents: priceCents(formData, "price"),
      sold_price_cents: priceCents(formData, "sold_price"),
      status,
      ownership: readOwnership(formData),
      consignment_split_artist_pct: num(formData, "consignment_split_artist_pct"),
      acquired_at: readDate(formData, "acquired_at"),
      sold_at,
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/artworks");
  revalidatePath(`/admin/artworks/${id}`);
  revalidatePath("/art");
  revalidatePath("/sold");
  revalidatePath(`/art/${slug}`);
}

export async function setCoverImage(artworkId: string, formData: FormData) {
  const supabase = createAdminClient();
  const url = field(formData, "cover_url");
  if (!url) throw new Error("Image URL is required");

  // Unset any existing cover
  await supabase
    .from("artwork_images")
    .update({ is_cover: false })
    .eq("artwork_id", artworkId)
    .eq("is_cover", true);

  // Try to find an existing image with this URL; otherwise insert a new one
  const { data: existing } = await supabase
    .from("artwork_images")
    .select("id")
    .eq("artwork_id", artworkId)
    .eq("public_url", url)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("artwork_images")
      .update({ is_cover: true, position: 0 })
      .eq("id", existing.id);
  } else {
    const { data: artwork } = await supabase
      .from("artworks")
      .select("title, slug")
      .eq("id", artworkId)
      .maybeSingle();
    await supabase.from("artwork_images").insert({
      artwork_id: artworkId,
      storage_path: `manual/${url}`,
      public_url: url,
      alt_text: artwork?.title ?? null,
      is_cover: true,
      position: 0,
    });
  }

  revalidatePath(`/admin/artworks/${artworkId}`);
  revalidatePath("/admin/artworks");
  revalidatePath("/art");
}

export async function deleteArtwork(id: string) {
  const supabase = createAdminClient();
  await supabase.from("artwork_images").delete().eq("artwork_id", id);
  const { error } = await supabase.from("artworks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/artworks");
  revalidatePath("/art");
  redirect("/admin/artworks");
}

export async function archiveArtwork(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("artworks")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/artworks");
  revalidatePath(`/admin/artworks/${id}`);
  revalidatePath("/art");
}
