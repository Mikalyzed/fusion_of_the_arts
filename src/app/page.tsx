import Link from "next/link";
import Image from "next/image";
import { getArtworks } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";

export const revalidate = 60;

const VALUES = [
  {
    letter: "L",
    title: "Love",
    body:
      "At Mikalyzed, we believe in building strong, lasting relationships with our clients and community. Our commitment is rooted in love — love for what we do, love for the people we serve, and love for the impact we make together. We strive to infuse every interaction with care, integrity, and dedication, ensuring our services not only meet but exceed your expectations.",
  },
  {
    letter: "I",
    title: "Integrity",
    body:
      "Integrity is the cornerstone of everything we do. Our business is built on honesty, transparency, and ethical conduct. We are dedicated to delivering quality and value while upholding the highest standards of integrity in all our interactions. Trust us to be your reliable partner, committed to fostering relationships as strong and enduring as the values we cherish.",
  },
  {
    letter: "F",
    title: "Faith",
    body:
      "Faith is at the heart of Mikalyzed. Our actions and decisions are driven by a deep belief in our mission and values. We operate with integrity, compassion, and respect, ensuring our business practices reflect our core principles. With faith guiding us, we aim to create positive impacts and build lasting relationships with our clients and community.",
  },
  {
    letter: "F",
    title: "Family",
    body:
      "Family is the cornerstone of Mikalyzed. We treat our clients and team members with the same care and respect as family, fostering a supportive and trusting environment. Join us and experience the difference a family-oriented business can make, where you are valued and appreciated.",
  },
  {
    letter: "E",
    title: "Excellence",
    body:
      "Excellence is not just a goal; it's our standard. We are committed to continuously improving and pushing the boundaries of what's possible. Our dedication to excellence drives us to deliver outstanding products and services, consistently exceeding our clients' expectations. Every detail matters.",
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

      {/* Values — LIFFE */}
      <section className="mx-auto max-w-6xl px-6 py-24 border-t border-zinc-200">
        <div className="max-w-2xl">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Our values
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-light leading-tight">
            Love, Integrity, Faith,
            <br className="hidden sm:block" /> Family, Excellence.
          </h2>
          <p className="mt-5 text-zinc-600 leading-relaxed">
            Five principles that guide how we run the gallery and treat the
            people we work with.
          </p>
        </div>

        <div className="mt-16 divide-y divide-zinc-100 border-t border-zinc-100">
          {VALUES.map((v, i) => (
            <div
              key={i}
              className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-16 py-12"
            >
              <div className="md:w-56">
                <p className="text-7xl font-light text-zinc-300 leading-none">
                  {v.letter}
                </p>
                <h3 className="mt-5 text-[11px] tracking-[0.3em] uppercase font-medium text-zinc-900">
                  {v.title}
                </h3>
              </div>
              <p className="text-zinc-700 leading-relaxed text-[15px] max-w-2xl">
                {v.body}
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
