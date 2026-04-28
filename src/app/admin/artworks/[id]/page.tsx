import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArtworkForm } from "@/components/admin/ArtworkForm";
import {
  updateArtwork,
  deleteArtwork,
  archiveArtwork,
} from "@/lib/actions/artworks";

type Params = { id: string };

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: artwork }, { data: artists }] = await Promise.all([
    supabase
      .from("artworks")
      .select("*, artwork_images(public_url, is_cover, position)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("artists").select("id, full_name").order("full_name"),
  ]);

  if (!artwork) notFound();

  const images = (artwork.artwork_images ?? []) as Array<{
    public_url: string | null;
    is_cover: boolean;
    position: number;
  }>;
  const cover =
    images.find((i) => i.is_cover) ??
    [...images].sort((a, b) => a.position - b.position)[0];

  const updateAction = updateArtwork.bind(null, id);
  const deleteAction = deleteArtwork.bind(null, id);
  const archiveAction = archiveArtwork.bind(null, id);

  return (
    <div>
      <Link
        href="/admin/artworks"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Artworks
      </Link>
      <header className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Edit artwork
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            {artwork.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">/art/{artwork.slug}</p>
        </div>
        <Link
          href={`/art/${artwork.slug}`}
          target="_blank"
          className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
        >
          View public →
        </Link>
      </header>

      {cover?.public_url && (
        <div className="mt-6 inline-block bg-white border border-zinc-200 p-3">
          <div className="relative w-32 h-32 bg-zinc-100">
            <Image
              src={cover.public_url}
              alt={artwork.title}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      <div className="mt-8">
        <ArtworkForm
          initial={artwork}
          artists={artists ?? []}
          action={updateAction}
          submitLabel="Save changes"
          currentCoverUrl={cover?.public_url ?? null}
          showSlug
        />
      </div>

      <section className="mt-16 max-w-3xl border-t border-zinc-200 pt-8 space-y-6">
        <div>
          <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-700 mb-3">
            Quick actions
          </h2>
          <form action={archiveAction}>
            <button
              type="submit"
              className="px-5 py-2.5 border border-zinc-300 text-zinc-700 text-[11px] tracking-[0.25em] uppercase hover:border-zinc-900 hover:text-zinc-900 transition-colors"
            >
              Archive (hide publicly)
            </button>
          </form>
        </div>

        <div className="border-t border-zinc-200 pt-6">
          <h2 className="text-[11px] tracking-[0.25em] uppercase text-red-700 mb-3">
            Danger zone
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            Permanently delete this artwork and its images. Cannot be undone.
          </p>
          <form action={deleteAction}>
            <button
              type="submit"
              className="px-5 py-2.5 border border-red-300 text-red-700 text-[11px] tracking-[0.25em] uppercase hover:bg-red-50 transition-colors"
            >
              Delete artwork
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
