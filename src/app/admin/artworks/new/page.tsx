import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import { createArtwork } from "@/lib/actions/artworks";

export default async function NewArtworkPage() {
  const supabase = createAdminClient();
  const { data: artists } = await supabase
    .from("artists")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  return (
    <div>
      <Link
        href="/admin/artworks"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Artworks
      </Link>
      <h1 className="mt-3 text-3xl tracking-tight font-light">New artwork</h1>
      <p className="mt-2 text-zinc-600 text-sm">
        Title and artist are required. Everything else can be filled in later.
      </p>
      <div className="mt-8">
        {(artists ?? []).length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 px-5 py-4 text-sm text-amber-900">
            You need at least one artist before you can add an artwork.{" "}
            <Link
              href="/admin/artists/new"
              className="underline underline-offset-4 hover:text-amber-950"
            >
              Add an artist first →
            </Link>
          </div>
        ) : (
          <ArtworkForm
            artists={artists ?? []}
            action={createArtwork}
            submitLabel="Create artwork"
          />
        )}
      </div>
    </div>
  );
}
