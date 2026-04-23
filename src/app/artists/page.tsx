import Link from "next/link";
import Image from "next/image";
import { getArtists } from "@/lib/supabase/queries";

export const revalidate = 60;

export const metadata = {
  title: "Artists",
  description: "Artists represented by Fusion of the Arts.",
};

export default async function ArtistsPage() {
  const artists = await getArtists();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="border-b border-zinc-200 pb-8">
        <h1 className="font-serif text-4xl tracking-tight">Artists</h1>
      </header>

      {artists.length === 0 ? (
        <p className="mt-12 text-zinc-500">No artists listed yet.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="group flex gap-5 items-start"
            >
              <div className="relative w-24 h-24 bg-zinc-100 rounded-full overflow-hidden shrink-0">
                {artist.photo_url ? (
                  <Image
                    src={artist.photo_url}
                    alt={artist.full_name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xl font-serif">
                    {artist.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-xl group-hover:underline underline-offset-4">
                  {artist.full_name}
                </h2>
                {artist.bio && (
                  <p className="mt-1 text-sm text-zinc-600 line-clamp-3">
                    {artist.bio}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
