// Bulk-import every image in public/artworks/ as a draft artwork.
// Run with: npm run import-art
// Idempotent: re-running skips images already imported (matched by public_url).

import { createClient } from "@supabase/supabase-js";
import { readdirSync } from "node:fs";
import { parse } from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local",
  );
  process.exit(1);
}

const ART_DIR = "public/artworks";
const PUBLIC_URL_PREFIX = "/artworks/";
const PLACEHOLDER_ARTIST_SLUG = "tbd";
const PLACEHOLDER_ARTIST_NAME = "TBD";
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensurePlaceholderArtist() {
  const { data: existing, error: selectErr } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", PLACEHOLDER_ARTIST_SLUG)
    .maybeSingle();
  if (selectErr) throw selectErr;
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("artists")
    .insert({
      slug: PLACEHOLDER_ARTIST_SLUG,
      full_name: PLACEHOLDER_ARTIST_NAME,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function uniqueSlug(base) {
  let candidate = base;
  let i = 2;
  // Loop until we find an unused slug. Bounded for safety.
  for (let tries = 0; tries < 50; tries++) {
    const { data } = await supabase
      .from("artworks")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${i++}`;
  }
  throw new Error(`Could not find unique slug for ${base}`);
}

async function main() {
  let files;
  try {
    files = readdirSync(ART_DIR)
      .filter((f) => !f.startsWith("."))
      .filter((f) => IMAGE_EXTENSIONS.includes(parse(f).ext.toLowerCase()));
  } catch (e) {
    console.error(`Cannot read ${ART_DIR}: ${e.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log(`No images in ${ART_DIR}.`);
    return;
  }

  console.log(`Found ${files.length} image(s) in ${ART_DIR}`);
  const artistId = await ensurePlaceholderArtist();

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const publicUrl = PUBLIC_URL_PREFIX + file;

    const { data: existingImage } = await supabase
      .from("artwork_images")
      .select("id")
      .eq("public_url", publicUrl)
      .maybeSingle();
    if (existingImage) {
      console.log(`SKIP  ${file}  (already imported)`);
      skipped++;
      continue;
    }

    const baseName = parse(file).name;
    const baseSlug = slugify(baseName) || `untitled-${Date.now()}`;
    const slug = await uniqueSlug(baseSlug);

    const today = new Date().toISOString().slice(0, 10);

    const { data: artwork, error: artErr } = await supabase
      .from("artworks")
      .insert({
        slug,
        title: baseName,
        artist_id: artistId,
        status: "available",
        ownership: "owned",
        acquired_at: today,
      })
      .select("id, slug")
      .single();
    if (artErr) {
      console.error(`FAIL  ${file}: ${artErr.message}`);
      continue;
    }

    const { error: imgErr } = await supabase.from("artwork_images").insert({
      artwork_id: artwork.id,
      storage_path: `local/${file}`,
      public_url: publicUrl,
      alt_text: baseName,
      is_cover: true,
      position: 0,
    });
    if (imgErr) {
      console.error(`FAIL  ${file} (image insert): ${imgErr.message}`);
      continue;
    }

    console.log(`OK    ${file}  →  ${artwork.slug}`);
    imported++;
  }

  console.log(`\nDone. Imported ${imported}, skipped ${skipped}.`);
  if (imported > 0) {
    console.log(
      `Edit drafts in Supabase Table Editor (artworks) — change status to 'available' to publish.`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
