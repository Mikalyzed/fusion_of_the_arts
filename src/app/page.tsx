import Link from "next/link";
import Image from "next/image";
import { getArtworks, getCurrentExhibition } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";
import { LiffeValues } from "@/components/LiffeValues";
import { NowShowing } from "@/components/NowShowing";

export const revalidate = 60;

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default async function HomePage() {
  const [available, sold, currentExhibition] = await Promise.all([
    getArtworks("available"),
    getArtworks("sold"),
    getCurrentExhibition(),
  ]);
  const featured = shuffle(available).slice(0, 6);
  const recentlySold = sold.slice(0, 6);

  return (
    <div>
      {/* Hero — image with buttons centered at the bottom */}
      <section className="relative min-h-[80vh] md:min-h-[85vh] flex items-end justify-center overflow-hidden bg-zinc-900">
        <Image
          src="/hero-gallery.png"
          alt="Gallery installation view"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="relative px-6 pb-14 md:pb-20 w-full flex flex-wrap gap-3 justify-center">
          <Link
            href="/art"
            className="inline-flex items-center px-7 py-3.5 border border-white text-[11px] tracking-[0.25em] uppercase text-white hover:bg-white hover:text-zinc-900 transition-colors"
          >
            Browse Collection
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-7 py-3.5 border border-white/40 text-[11px] tracking-[0.25em] uppercase text-white/90 hover:border-white hover:text-white transition-colors"
          >
            Contact
          </Link>
        </div>
      </section>

      {/* Now showing */}
      {currentExhibition && <NowShowing exhibition={currentExhibition} />}

      {/* Featured works — magazine layout */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex items-end justify-between mb-14 gap-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
                01 · Currently available
              </p>
              <h2 className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1]">
                <span className="font-display italic font-light">Featured</span>{" "}
                <span className="font-light">works</span>
              </h2>
            </div>
            <Link
              href="/art"
              className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
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

      {/* LIFFE */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            02 · Behind the gallery
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1]">
            <span className="font-display italic font-light">Art</span>
            <span className="font-light">, guided by LIFFE.</span>
          </h2>
          <p className="mt-5 text-zinc-600 leading-relaxed">
            Five principles shape every piece we choose and every artist we
            represent.
          </p>
        </div>
        <LiffeValues />
      </section>

      {/* Recently sold */}
      {recentlySold.length > 0 && (
        <section className="border-t border-zinc-200 py-24">
          <div className="mx-auto max-w-6xl px-6 mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
                03 · Archive
              </p>
              <h2 className="mt-3 text-4xl md:text-5xl tracking-tight leading-[1]">
                <span className="font-display italic font-light">Recently</span>{" "}
                <span className="font-light">sold</span>
              </h2>
            </div>
            <Link
              href="/sold"
              className="text-[11px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900 whitespace-nowrap"
            >
              Sold archive →
            </Link>
          </div>
          <div className="overflow-x-auto pb-4 pl-6 pr-6 -mx-px [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-zinc-300 [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="flex gap-6 min-w-min">
              {recentlySold.map((a) => (
                <div key={a.id} className="w-72 shrink-0">
                  <ArtworkCard artwork={a} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
