import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { updateArtist, deleteArtist } from "@/lib/actions/artists";

type Params = { id: string };

export default async function EditArtistPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: artist, error } = await supabase
    .from("artists")
    .select("*, artworks(id, slug, title, status)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!artist) notFound();

  const updateAction = updateArtist.bind(null, id);
  const deleteAction = deleteArtist.bind(null, id);

  const artworks = (artist.artworks ?? []) as Array<{
    id: string;
    slug: string;
    title: string;
    status: string;
  }>;

  return (
    <div>
      <Link
        href="/admin/artists"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Artists
      </Link>
      <header className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Edit artist
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            {artist.full_name}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">/artists/{artist.slug}</p>
        </div>
        <Link
          href={`/artists/${artist.slug}`}
          target="_blank"
          className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
        >
          View public →
        </Link>
      </header>

      <div className="mt-8">
        <ArtistForm
          initial={artist}
          action={updateAction}
          submitLabel="Save changes"
          showSlug
        />
      </div>

      {artworks.length > 0 && (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-700 mb-4">
            Works ({artworks.length})
          </h2>
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            {artworks.map((w) => (
              <Link
                key={w.id}
                href={`/admin/artworks/${w.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 text-sm"
              >
                <span>{w.title}</span>
                <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-500">
                  {w.status}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 max-w-3xl border-t border-zinc-200 pt-8">
        <h2 className="text-[11px] tracking-[0.25em] uppercase text-red-700 mb-3">
          Danger zone
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Delete this artist. Their artworks must be reassigned or removed
          first — this will fail otherwise.
        </p>
        <form action={deleteAction}>
          <button
            type="submit"
            className="px-5 py-2.5 border border-red-300 text-red-700 text-[11px] tracking-[0.25em] uppercase hover:bg-red-50 transition-colors"
          >
            Delete artist
          </button>
        </form>
      </section>
    </div>
  );
}
