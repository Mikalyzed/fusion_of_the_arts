import Link from "next/link";
import { getArtworks } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";

export const revalidate = 60;

const PROCESS = [
  {
    n: "01",
    title: "Browse the collection",
    body: "Explore available works from our roster of painters, mixed-media artists, and printmakers.",
  },
  {
    n: "02",
    title: "Inquire",
    body: "Reach out about any piece that speaks to you. We'll share provenance, dimensions, and availability.",
  },
  {
    n: "03",
    title: "Visit or ship",
    body: "Arrange a gallery viewing, pickup, or delivery to your space worldwide.",
  },
];

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
      <section className="mx-auto max-w-6xl px-6 min-h-[70vh] flex items-center py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Original Art · Curated Collection
          </p>
          <h1 className="mt-6 text-5xl md:text-7xl tracking-tight leading-[0.95] font-light">
            Art, thoughtfully
            <br />
            curated.
          </h1>
          <p className="mt-8 text-lg text-zinc-600 max-w-xl leading-relaxed">
            Paintings, mixed-media, and prints from working artists. Browse the
            collection online or visit the gallery.
          </p>
          <div className="mt-12 flex flex-wrap gap-3">
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

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-20 border-t border-zinc-200">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          How it works
        </p>
        <div className="mt-10 grid md:grid-cols-3 gap-10 md:gap-16">
          {PROCESS.map((step) => (
            <div key={step.n}>
              <p className="text-4xl font-light text-zinc-300">{step.n}</p>
              <h3 className="mt-4 text-base font-medium tracking-tight">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
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
