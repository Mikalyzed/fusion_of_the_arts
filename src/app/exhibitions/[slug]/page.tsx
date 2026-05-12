import Link from "next/link";
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
      <header className="mx-auto max-w-3xl px-6 pt-12 pb-20 text-center">
        <Link
          href="/exhibitions"
          className="text-[11px] tracking-[0.25em] uppercase text-zinc-500 hover:text-zinc-900"
        >
          ← Exhibitions
        </Link>

        <div className="mt-16">
          <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500">
            {formatDateRange(e.starts_at, e.ends_at)}
          </p>

          <h1 className="mt-6 text-6xl md:text-7xl font-display italic font-light leading-[0.95] text-zinc-900">
            {e.title}
          </h1>

          <div className="mt-12 mx-auto w-16 h-px bg-zinc-300" />

          {e.curator && (
            <p className="mt-10 text-[11px] tracking-[0.3em] uppercase text-zinc-700">
              Curated by{" "}
              <span className="text-zinc-900">{e.curator}</span>
            </p>
          )}
          {e.collaboration && (
            <p className="mt-4 text-sm text-zinc-500 max-w-md mx-auto leading-relaxed font-display italic">
              {e.collaboration}
            </p>
          )}
          {e.statement && (
            <p className="mt-8 text-zinc-700 leading-relaxed max-w-xl mx-auto whitespace-pre-line">
              {e.statement}
            </p>
          )}
        </div>
      </header>

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
