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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex flex-col sm:flex-row gap-8 items-start border-b border-zinc-200 pb-10">
        <div className="relative w-40 h-40 bg-zinc-100 rounded-full overflow-hidden shrink-0">
          {artist.photo_url ? (
            <Image
              src={artist.photo_url}
              alt={artist.full_name}
              fill
              sizes="160px"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-4xl font-serif">
              {artist.full_name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-serif text-4xl tracking-tight">{artist.full_name}</h1>
          {artist.bio && (
            <p className="mt-4 text-zinc-700 leading-relaxed max-w-2xl">
              {artist.bio}
            </p>
          )}
          {(artist.website || artist.instagram) && (
            <div className="mt-4 flex gap-4 text-sm text-zinc-600">
              {artist.website && (
                <a
                  href={artist.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 underline-offset-4 hover:underline"
                >
                  Website
                </a>
              )}
              {artist.instagram && (
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 underline-offset-4 hover:underline"
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
          <h2 className="font-serif text-2xl">Available</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <section className="mt-16">
          <h2 className="font-serif text-2xl">Sold</h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
        <p className="mt-16 text-zinc-500">No works by this artist yet.</p>
      )}
    </div>
  );
}
