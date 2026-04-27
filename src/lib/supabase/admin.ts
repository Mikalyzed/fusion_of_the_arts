import { createClient } from "@supabase/supabase-js";

// Server-only client that bypasses RLS via the secret key.
// NEVER import this file from a client component.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY",
    );
  }
  return createClient(url, secret, {
    auth: { persistSession: false },
  });
}
