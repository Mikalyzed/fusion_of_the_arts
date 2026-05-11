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

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

async function uniqueSlug(
  supabase: ReturnType<typeof createAdminClient>,
  base: string,
  ignoreId?: string,
) {
  let candidate = base;
  let i = 2;
  for (let tries = 0; tries < 50; tries++) {
    const query = supabase
      .from("exhibitions")
      .select("id")
      .eq("slug", candidate);
    const { data } = ignoreId
      ? await query.neq("id", ignoreId).maybeSingle()
      : await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  throw new Error(`Could not find unique slug for ${base}`);
}

export async function createExhibition(formData: FormData) {
  const supabase = createAdminClient();

  const title = field(formData, "title");
  if (!title) throw new Error("Title is required");
  const startsAt = field(formData, "starts_at");
  const endsAt = field(formData, "ends_at");
  if (!startsAt || !endsAt) throw new Error("Start and end dates are required");

  const baseSlug = field(formData, "slug") ?? slugify(title);
  const slug = await uniqueSlug(supabase, baseSlug);

  const { data, error } = await supabase
    .from("exhibitions")
    .insert({
      slug,
      title,
      curator: field(formData, "curator"),
      collaboration: field(formData, "collaboration"),
      statement: field(formData, "statement"),
      hero_image_url: field(formData, "hero_image_url"),
      starts_at: startsAt,
      ends_at: endsAt,
      is_published: bool(formData, "is_published"),
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/admin/exhibitions");
  revalidatePath("/exhibitions");
  revalidatePath("/");
  redirect(`/admin/exhibitions/${data.id}`);
}

export async function updateExhibition(id: string, formData: FormData) {
  const supabase = createAdminClient();

  const title = field(formData, "title");
  if (!title) throw new Error("Title is required");
  const startsAt = field(formData, "starts_at");
  const endsAt = field(formData, "ends_at");
  if (!startsAt || !endsAt) throw new Error("Start and end dates are required");

  const submittedSlug = field(formData, "slug");
  const baseSlug = submittedSlug ?? slugify(title);
  const slug = await uniqueSlug(supabase, baseSlug, id);

  const { error } = await supabase
    .from("exhibitions")
    .update({
      slug,
      title,
      curator: field(formData, "curator"),
      collaboration: field(formData, "collaboration"),
      statement: field(formData, "statement"),
      hero_image_url: field(formData, "hero_image_url"),
      starts_at: startsAt,
      ends_at: endsAt,
      is_published: bool(formData, "is_published"),
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/exhibitions");
  revalidatePath(`/admin/exhibitions/${id}`);
  revalidatePath("/exhibitions");
  revalidatePath(`/exhibitions/${slug}`);
  revalidatePath("/");
}

export async function deleteExhibition(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("exhibitions").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/exhibitions");
  revalidatePath("/exhibitions");
  revalidatePath("/");
  redirect("/admin/exhibitions");
}

export async function attachArtwork(exhibitionId: string, formData: FormData) {
  const supabase = createAdminClient();
  const artworkId = field(formData, "artwork_id");
  if (!artworkId) return;

  // Insert; ignore conflict so re-adding the same pair is a no-op.
  await supabase
    .from("exhibition_artworks")
    .upsert(
      { exhibition_id: exhibitionId, artwork_id: artworkId, position: 0 },
      { onConflict: "exhibition_id,artwork_id" },
    );

  revalidatePath(`/admin/exhibitions/${exhibitionId}`);
  revalidatePath("/exhibitions");
}

export async function detachArtwork(exhibitionId: string, artworkId: string) {
  const supabase = createAdminClient();
  await supabase
    .from("exhibition_artworks")
    .delete()
    .eq("exhibition_id", exhibitionId)
    .eq("artwork_id", artworkId);

  revalidatePath(`/admin/exhibitions/${exhibitionId}`);
  revalidatePath("/exhibitions");
}

export async function attachAllAvailableArtworks(exhibitionId: string) {
  const supabase = createAdminClient();
  const { data: artworks } = await supabase
    .from("artworks")
    .select("id")
    .in("status", ["available", "sold"]);
  if (!artworks || artworks.length === 0) return;

  const rows = artworks.map((a) => ({
    exhibition_id: exhibitionId,
    artwork_id: a.id,
    position: 0,
  }));
  await supabase
    .from("exhibition_artworks")
    .upsert(rows, { onConflict: "exhibition_id,artwork_id" });

  revalidatePath(`/admin/exhibitions/${exhibitionId}`);
  revalidatePath("/exhibitions");
}
