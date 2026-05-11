import Link from "next/link";
import Image from "next/image";
import { getArtworks, getCurrentExhibition } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";
import { LiffeValues } from "@/components/LiffeValues";
import { Marquee } from "@/components/Marquee";
import { NowShowing } from "@/components/NowShowing";

export const revalidate = 60;

export default async function HomePage() {
  const [available, sold, currentExhibition] = await Promise.all([
    getArtworks("available"),
    getArtworks("sold"),
    getCurrentExhibition(),
  ]);
  const featured = available.slice(0, 6);
  const recentlySold = sold.slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 min-h-[75vh] flex items-center py-24">
        <div className="max-w-3xl w-full">
          <Image
            src="/logo.svg"
            alt="Fusion of the Arts"
            width={1200}
            height={372}
            priority
            className="w-full max-w-[560px] h-auto"
          />
          <p className="mt-12 text-lg text-zinc-700 max-w-xl leading-relaxed">
            Original paintings, mixed-media, and prints from working artists —{" "}
            <span className="font-display italic text-zinc-900">
              for the people who live with them.
            </span>
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
        <div className="absolute right-6 bottom-12 hidden md:block text-right text-[10px] tracking-[0.3em] uppercase text-zinc-400 leading-relaxed">
          Est.
          <br />
          MMXXVI
        </div>
      </section>

      {/* Now showing */}
      {currentExhibition && <NowShowing exhibition={currentExhibition} />}

      {/* Marquee */}
      <Marquee />

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
