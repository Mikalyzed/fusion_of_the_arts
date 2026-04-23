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
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="border-b border-zinc-200 pb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          Roster
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-light">
          Artists
        </h1>
      </header>

      {artists.length === 0 ? (
        <p className="mt-16 text-zinc-500 text-sm">No artists listed yet.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {artists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artists/${artist.slug}`}
              className="group flex gap-5 items-start"
            >
              <div className="relative w-20 h-20 bg-zinc-100 overflow-hidden shrink-0">
                {artist.photo_url ? (
                  <Image
                    src={artist.photo_url}
                    alt={artist.full_name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xl font-light">
                    {artist.full_name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 pt-1">
                <h2 className="text-base font-medium tracking-tight group-hover:underline underline-offset-4 decoration-zinc-300">
                  {artist.full_name}
                </h2>
                {artist.bio && (
                  <p className="mt-2 text-sm text-zinc-600 line-clamp-3 leading-relaxed">
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
