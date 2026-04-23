import Link from "next/link";
import { getArtworks } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";

export const revalidate = 60;

export default async function HomePage() {
  const [available, sold] = await Promise.all([
    getArtworks("available"),
    getArtworks("sold"),
  ]);
  const featured = available.slice(0, 6);
  const recentlySold = sold.slice(0, 3);

  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <h1 className="font-serif text-5xl sm:text-6xl tracking-tight max-w-3xl">
          Fusion of the Arts
        </h1>
        <p className="mt-6 text-lg text-zinc-600 max-w-xl leading-relaxed">
          Original works from painters, mixed-media artists, and printmakers.
          Visit the gallery or browse the collection below.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/art"
            className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            Browse available
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 border border-zinc-300 hover:border-zinc-900 transition-colors"
          >
            Contact
          </Link>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-zinc-200">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-serif text-3xl">Available</h2>
            <Link
              href="/art"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}

      {recentlySold.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-zinc-200">
          <div className="flex items-baseline justify-between mb-10">
            <h2 className="font-serif text-3xl">Recently sold</h2>
            <Link
              href="/sold"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              Sold archive →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentlySold.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
