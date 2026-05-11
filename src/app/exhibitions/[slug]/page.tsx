import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getExhibitionBySlug } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";
import { formatDateRange } from "@/lib/format-date";

export const revalidate = 60;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const e = await getExhibitionBySlug(slug);
  if (!e) return { title: "Not found" };
  return {
    title: e.title,
    description: e.statement ?? undefined,
    openGraph: e.hero_image_url
      ? { title: e.title, images: [{ url: e.hero_image_url }] }
      : undefined,
  };
}

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const e = await getExhibitionBySlug(slug);
  if (!e) notFound();

  return (
    <article>
      <header className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <Link
          href="/exhibitions"
          className="text-[11px] tracking-[0.25em] uppercase text-zinc-500 hover:text-zinc-900"
        >
          ← Exhibitions
        </Link>
        <p className="mt-8 text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          {formatDateRange(e.starts_at, e.ends_at)}
        </p>
        <h1 className="mt-4 text-5xl md:text-7xl tracking-tight leading-[0.95]">
          <span className="font-display italic font-light">{e.title}</span>
        </h1>
        {e.curator && (
          <p className="mt-6 text-zinc-600">
            Curated by{" "}
            <span className="text-zinc-900">{e.curator}</span>
          </p>
        )}
        {e.collaboration && (
          <p className="mt-1 text-sm text-zinc-500">{e.collaboration}</p>
        )}
      </header>

      {e.hero_image_url && (
        <div className="relative w-full aspect-[3/1] bg-zinc-100 overflow-hidden">
          <Image
            src={e.hero_image_url}
            alt={e.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {e.statement && (
        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500 mb-6">
            Statement
          </p>
          <div className="text-zinc-700 leading-relaxed text-lg whitespace-pre-line">
            {e.statement}
          </div>
        </section>
      )}

      {e.works.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-16 border-t border-zinc-200">
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            On view
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl tracking-tight font-light">
            Works in the show
          </h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {e.works.map((w) => (
              <ArtworkCard key={w.id} artwork={w} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
