import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import {
  updateExhibition,
  deleteExhibition,
  attachArtwork,
  detachArtwork,
  attachAllAvailableArtworks,
} from "@/lib/actions/exhibitions";

type Params = { id: string };

export default async function EditExhibitionPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: exhibition }, { data: allArtworks }] = await Promise.all([
    supabase
      .from("exhibitions")
      .select(
        `
        *,
        exhibition_artworks(
          artwork_id, position,
          artwork:artworks(
            id, slug, title, status,
            artwork_images(public_url, is_cover, position)
          )
        )
        `,
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("artworks")
      .select("id, title, status")
      .in("status", ["available", "sold", "draft"])
      .order("title"),
  ]);

  if (!exhibition) notFound();

  const updateAction = updateExhibition.bind(null, id);
  const deleteAction = deleteExhibition.bind(null, id);
  const attachAction = attachArtwork.bind(null, id);
  const attachAllAction = attachAllAvailableArtworks.bind(null, id);

  type Joined = {
    artwork_id: string;
    artwork: {
      id: string;
      slug: string;
      title: string;
      status: string;
      artwork_images: Array<{
        public_url: string | null;
        is_cover: boolean;
        position: number;
      }>;
    };
  };
  const attached =
    (exhibition.exhibition_artworks as Joined[] | null)
      ?.filter((j) => j.artwork)
      .map((j) => j.artwork) ?? [];
  const attachedIds = new Set(attached.map((a) => a.id));
  const availableForAttach =
    (allArtworks as Array<{ id: string; title: string; status: string }> | null)?.filter(
      (a) => !attachedIds.has(a.id),
    ) ?? [];

  return (
    <div>
      <Link
        href="/admin/exhibitions"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Exhibitions
      </Link>
      <header className="mt-3 flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Edit exhibition
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            {exhibition.title}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            /exhibitions/{exhibition.slug}
          </p>
        </div>
        <Link
          href={`/exhibitions/${exhibition.slug}`}
          target="_blank"
          className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
        >
          View public →
        </Link>
      </header>

      <div className="mt-8">
        <ExhibitionForm
          initial={exhibition}
          action={updateAction}
          submitLabel="Save changes"
          showSlug
        />
      </div>

      <section className="mt-16 max-w-3xl">
        <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-700 mb-4">
          Works in the show ({attached.length})
        </h2>

        <div className="flex gap-3 mb-6">
          <form action={attachAction} className="flex gap-2 flex-1">
            <select
              name="artwork_id"
              defaultValue=""
              className="flex-1 border border-zinc-300 px-3 py-2 text-sm bg-white"
              required
            >
              <option value="" disabled>
                Add a work…
              </option>
              {availableForAttach.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} {a.status === "draft" ? " (draft)" : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-5 py-2 border border-zinc-900 text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Attach
            </button>
          </form>
          <form action={attachAllAction}>
            <button
              type="submit"
              className="px-5 py-2 border border-zinc-300 text-zinc-700 text-[11px] tracking-[0.25em] uppercase hover:border-zinc-900 hover:text-zinc-900 transition-colors whitespace-nowrap"
              title="Attach every available/sold artwork"
            >
              Attach all
            </button>
          </form>
        </div>

        {attached.length === 0 ? (
          <p className="text-sm text-zinc-500">No works attached yet.</p>
        ) : (
          <div className="bg-white border border-zinc-200 divide-y divide-zinc-100">
            {attached.map((a) => {
              const cover =
                a.artwork_images.find((i) => i.is_cover) ??
                [...a.artwork_images].sort((x, y) => x.position - y.position)[0];
              const detachAction = detachArtwork.bind(null, id, a.id);
              return (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-zinc-100">
                      {cover?.public_url && (
                        <Image
                          src={cover.public_url}
                          alt={a.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="text-sm">
                      <Link
                        href={`/admin/artworks/${a.id}`}
                        className="font-medium text-zinc-900 hover:underline underline-offset-4"
                      >
                        {a.title}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        /art/{a.slug} · {a.status}
                      </div>
                    </div>
                  </div>
                  <form action={detachAction}>
                    <button
                      type="submit"
                      className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-3xl border-t border-zinc-200 pt-8">
        <h2 className="text-[11px] tracking-[0.25em] uppercase text-red-700 mb-3">
          Danger zone
        </h2>
        <p className="text-sm text-zinc-600 mb-4">
          Permanently delete this exhibition. Artworks are not affected (only
          their association is removed).
        </p>
        <form action={deleteAction}>
          <button
            type="submit"
            className="px-5 py-2.5 border border-red-300 text-red-700 text-[11px] tracking-[0.25em] uppercase hover:bg-red-50 transition-colors"
          >
            Delete exhibition
          </button>
        </form>
      </section>
    </div>
  );
}
