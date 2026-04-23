import Link from "next/link";
import Image from "next/image";
import { getArtworks } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";
import { LiffeValues } from "@/components/LiffeValues";

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
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 min-h-[75vh] flex items-center py-24">
        <div className="max-w-3xl w-full">
          <Image
            src="/logo.svg"
            alt="Fusion of the Arts"
            width={1200}
            height={372}
            priority
            className="w-full max-w-[560px] h-auto"
          />
          <p className="mt-12 text-lg text-zinc-600 max-w-xl leading-relaxed">
            Original paintings, mixed-media, and prints from working artists.
            Browse the collection online or visit the gallery.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/art"
              className="inline-flex items-center px-7 py-3.5 border border-zinc-900 text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Browse Collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center px-7 py-3.5 border border-zinc-200 text-[11px] tracking-[0.25em] uppercase text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      {/* LIFFE — interactive values */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-zinc-200">
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-10 md:gap-16 items-start">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
              Behind the gallery
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-light leading-tight">
              Art, guided by LIFFE.
            </h2>
            <p className="mt-5 text-zinc-600 leading-relaxed max-w-md">
              Five principles shape every piece we choose, every artist we
              represent, and every conversation we have. Select a letter.
            </p>
          </div>
          <LiffeValues />
        </div>
      </section>

      {/* Featured available */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20 border-t border-zinc-200">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
                Currently available
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-light">
                Featured works
              </h2>
            </div>
            <Link
              href="/art"
              className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featured.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}

      {/* Recently sold */}
      {recentlySold.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-20 border-t border-zinc-200">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
                Archive
              </p>
              <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-light">
                Recently sold
              </h2>
            </div>
            <Link
              href="/sold"
              className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
            >
              Sold archive →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {recentlySold.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
