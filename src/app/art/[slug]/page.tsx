import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getArtworkBySlug } from "@/lib/supabase/queries";
import { formatPriceCents, formatDimensions } from "@/lib/format";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) return { title: "Not found" };

  return {
    title: `${artwork.title} — ${artwork.artist.full_name}`,
    description: artwork.description ?? `${artwork.title} by ${artwork.artist.full_name}`,
    openGraph: artwork.cover?.public_url
      ? {
          title: `${artwork.title} — ${artwork.artist.full_name}`,
          images: [{ url: artwork.cover.public_url }],
        }
      : undefined,
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const artwork = await getArtworkBySlug(slug);
  if (!artwork) notFound();

  const dimensions = formatDimensions(
    artwork.width_in,
    artwork.height_in,
    artwork.depth_in,
  );
  const isSold = artwork.status === "sold";

  return (
    <article className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10 lg:gap-16">
        <div className="space-y-4">
          {artwork.images.length === 0 ? (
            <div className="aspect-[4/5] bg-zinc-50 flex items-center justify-center text-zinc-400 text-xs tracking-widest uppercase">
              No image
            </div>
          ) : (
            artwork.images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-[4/5] bg-zinc-50 overflow-hidden"
              >
                {img.public_url && (
                  <Image
                    src={img.public_url}
                    alt={img.alt_text ?? artwork.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start space-y-8">
          {isSold && (
            <span className="inline-block bg-zinc-900 text-white text-[10px] tracking-[0.25em] uppercase px-3 py-1">
              Sold
            </span>
          )}

          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
              Artwork
            </p>
            <h1 className="mt-3 text-3xl md:text-4xl tracking-tight font-light leading-tight">
              {artwork.title}
            </h1>
            <Link
              href={`/artists/${artwork.artist.slug}`}
              className="mt-3 inline-block text-base text-zinc-700 hover:text-zinc-950 underline-offset-4 hover:underline decoration-zinc-300"
            >
              {artwork.artist.full_name}
            </Link>
          </div>

          <dl className="space-y-3 text-sm text-zinc-700 border-t border-zinc-200 pt-6">
            {artwork.medium && (
              <div className="flex gap-4">
                <dt className="w-28 text-[11px] tracking-[0.2em] uppercase text-zinc-500 pt-0.5">
                  Medium
                </dt>
                <dd>{artwork.medium}</dd>
              </div>
            )}
            {artwork.year_created && (
              <div className="flex gap-4">
                <dt className="w-28 text-[11px] tracking-[0.2em] uppercase text-zinc-500 pt-0.5">
                  Year
                </dt>
                <dd>{artwork.year_created}</dd>
              </div>
            )}
            {dimensions && (
              <div className="flex gap-4">
                <dt className="w-28 text-[11px] tracking-[0.2em] uppercase text-zinc-500 pt-0.5">
                  Dimensions
                </dt>
                <dd>{dimensions}</dd>
              </div>
            )}
          </dl>

          <div className="border-t border-zinc-200 pt-6">
            <p className="text-xl font-light">
              {isSold ? "Sold" : formatPriceCents(artwork.price_cents)}
            </p>
          </div>

          {artwork.description && (
            <p className="text-zinc-700 leading-relaxed whitespace-pre-line text-[15px]">
              {artwork.description}
            </p>
          )}

          {!isSold && (
            <Link
              href={`/contact?artwork=${artwork.slug}`}
              className="inline-flex items-center px-7 py-3.5 border border-zinc-900 text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-900 hover:text-white transition-colors"
            >
              Inquire
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
