import { notFound } from "next/navigation";
import Image from "next/image";
import { getArtistBySlug } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) return { title: "Not found" };
  return {
    title: artist.full_name,
    description: artist.bio ?? undefined,
  };
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artist = await getArtistBySlug(slug);
  if (!artist) notFound();

  const artistSummary = {
    id: artist.id,
    slug: artist.slug,
    full_name: artist.full_name,
  };

  const available = artist.artworks.filter((a) => a.status === "available");
  const sold = artist.artworks.filter((a) => a.status === "sold");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="flex flex-col sm:flex-row gap-8 items-start border-b border-zinc-200 pb-12">
        <div className="relative w-32 h-32 bg-zinc-100 overflow-hidden shrink-0">
          {artist.photo_url ? (
            <Image
              src={artist.photo_url}
              alt={artist.full_name}
              fill
              sizes="128px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-4xl font-light">
              {artist.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Artist
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-light">
            {artist.full_name}
          </h1>
          {artist.bio && (
            <p className="mt-6 text-zinc-700 leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
          )}
          {(artist.website || artist.instagram) && (
            <div className="mt-6 flex gap-5 text-[11px] tracking-[0.25em] uppercase text-zinc-600">
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900"
                >
                  Website
                </a>
              )}
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900"
                >
                  Instagram
                </a>
              )}
            </div>
          )}
        </div>
      </header>

      {available.length > 0 && (
        <section className="mt-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Currently available
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl tracking-tight font-light">
            Works for sale
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {available.map((a) => (
              <ArtworkCard
                key={a.id}
                artwork={{ ...a, artist: artistSummary }}
              />
            ))}
          </div>
        </section>
      )}

      {sold.length > 0 && (
        <section className="mt-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Archive
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl tracking-tight font-light">
            Previously sold
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {sold.map((a) => (
              <ArtworkCard
                key={a.id}
                artwork={{ ...a, artist: artistSummary }}
              />
            ))}
          </div>
        </section>
      )}

      {available.length === 0 && sold.length === 0 && (
        <p className="mt-16 text-zinc-500 text-sm">
          No works by this artist yet.
        </p>
      )}
    </div>
  );
}
