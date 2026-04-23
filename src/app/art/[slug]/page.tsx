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
            <div className="aspect-[4/5] bg-zinc-100 flex items-center justify-center text-zinc-400">
              No image
            </div>
          ) : (
            artwork.images.map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-[4/5] bg-zinc-100 overflow-hidden"
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

        <aside className="lg:sticky lg:top-8 lg:self-start space-y-6">
          {isSold && (
            <span className="inline-block bg-zinc-900 text-white text-[10px] tracking-[0.2em] uppercase px-3 py-1">
              Sold
            </span>
          )}

          <div>
            <h1 className="font-serif text-4xl tracking-tight">{artwork.title}</h1>
            <Link
              href={`/artists/${artwork.artist.slug}`}
              className="mt-2 inline-block text-lg text-zinc-700 hover:text-zinc-950 underline-offset-4 hover:underline"
            >
              {artwork.artist.full_name}
            </Link>
          </div>

          <dl className="space-y-2 text-sm text-zinc-700">
            {artwork.medium && (
              <div className="flex gap-3">
                <dt className="w-28 text-zinc-500">Medium</dt>
                <dd>{artwork.medium}</dd>
              </div>
            )}
            {artwork.year_created && (
              <div className="flex gap-3">
                <dt className="w-28 text-zinc-500">Year</dt>
                <dd>{artwork.year_created}</dd>
              </div>
            )}
            {dimensions && (
              <div className="flex gap-3">
                <dt className="w-28 text-zinc-500">Dimensions</dt>
                <dd>{dimensions}</dd>
              </div>
            )}
          </dl>

          <div className="pt-4 border-t border-zinc-200">
            <p className="text-xl">
              {isSold ? "Sold" : formatPriceCents(artwork.price_cents)}
            </p>
          </div>

          {artwork.description && (
            <p className="text-zinc-700 leading-relaxed whitespace-pre-line">
              {artwork.description}
            </p>
          )}

          {!isSold && (
            <Link
              href={`/contact?artwork=${artwork.slug}`}
              className="inline-block px-6 py-3 bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
            >
              Inquire about this piece
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
