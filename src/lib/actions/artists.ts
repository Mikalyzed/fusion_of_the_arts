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

async function uniqueSlug(supabase: ReturnType<typeof createAdminClient>, base: string, ignoreId?: string) {
  let candidate = base;
  let i = 2;
  for (let tries = 0; tries < 50; tries++) {
    const query = supabase.from("artists").select("id").eq("slug", candidate);
    const { data } = ignoreId
      ? await query.neq("id", ignoreId).maybeSingle()
      : await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  throw new Error(`Could not find unique slug for ${base}`);
}

export async function createArtist(formData: FormData) {
  const supabase = createAdminClient();
  const fullName = field(formData, "full_name");
  if (!fullName) throw new Error("Name is required");

  const baseSlug = field(formData, "slug") ?? slugify(fullName);
  const slug = await uniqueSlug(supabase, baseSlug);

  const { data, error } = await supabase
    .from("artists")
    .insert({
      slug,
      full_name: fullName,
      bio: field(formData, "bio"),
      photo_url: field(formData, "photo_url"),
      website: field(formData, "website"),
      instagram: field(formData, "instagram"),
      email: field(formData, "email"),
      phone: field(formData, "phone"),
      notes: field(formData, "notes"),
    })
    .select("id")
    .single();
  if (error) throw error;

  revalidatePath("/admin/artists");
  revalidatePath("/artists");
  redirect(`/admin/artists/${data.id}`);
}

export async function updateArtist(id: string, formData: FormData) {
  const supabase = createAdminClient();
  const fullName = field(formData, "full_name");
  if (!fullName) throw new Error("Name is required");

  const submittedSlug = field(formData, "slug");
  const baseSlug = submittedSlug ?? slugify(fullName);
  const slug = await uniqueSlug(supabase, baseSlug, id);

  const { error } = await supabase
    .from("artists")
    .update({
      slug,
      full_name: fullName,
      bio: field(formData, "bio"),
      photo_url: field(formData, "photo_url"),
      website: field(formData, "website"),
      instagram: field(formData, "instagram"),
      email: field(formData, "email"),
      phone: field(formData, "phone"),
      notes: field(formData, "notes"),
    })
    .eq("id", id);
  if (error) throw error;

  revalidatePath("/admin/artists");
  revalidatePath(`/admin/artists/${id}`);
  revalidatePath("/artists");
  revalidatePath(`/artists/${slug}`);
}

export async function deleteArtist(id: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("artists").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}
