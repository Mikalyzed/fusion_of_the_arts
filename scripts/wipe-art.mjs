// Delete all artists, artworks, and artwork_images via the secret key.
// Run with: npm run wipe-art

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { persistSession: false } },
);

// supabase-js requires a filter on delete; this matches everything.
const SENTINEL = "00000000-0000-0000-0000-000000000000";

await supabase.from("artwork_images").delete().neq("id", SENTINEL);
await supabase.from("artworks").delete().neq("id", SENTINEL);
await supabase.from("artists").delete().neq("id", SENTINEL);

console.log("Wiped artists, artworks, and artwork_images.");
