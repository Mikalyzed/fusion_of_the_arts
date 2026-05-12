"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

function field(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t === "" ? null : t;
}

export async function submitInquiry(formData: FormData) {
  const name = field(formData, "name");
  const email = field(formData, "email");
  const message = field(formData, "message");
  const phone = field(formData, "phone");
  const artworkSlug = field(formData, "artwork_slug");
  const honeypot = field(formData, "company"); // hidden field to deter bots

  if (honeypot) {
    // Silently accept — bots don't get an error signal.
    return { ok: true };
  }

  if (!name) throw new Error("Name is required");
  if (!email) throw new Error("Email is required");
  if (!message) throw new Error("Message is required");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please use a valid email address");
  }
  if (message.length > 5000) {
    throw new Error("Message is too long");
  }

  const supabase = createAdminClient();

  let artworkId: string | null = null;
  let inquiryType: "inquiry" | "reserve" = "inquiry";
  if (artworkSlug) {
    const { data: art } = await supabase
      .from("artworks")
      .select("id")
      .eq("slug", artworkSlug)
      .maybeSingle();
    if (art) {
      artworkId = art.id;
      inquiryType = "inquiry";
    }
  }

  const { error } = await supabase.from("inquiries").insert({
    artwork_id: artworkId,
    type: inquiryType,
    name,
    email,
    phone,
    message,
    status: "new",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  return { ok: true };
}
