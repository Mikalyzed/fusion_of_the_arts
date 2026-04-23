import { getArtworks } from "@/lib/supabase/queries";
import { ArtworkCard } from "@/components/ArtworkCard";

export const revalidate = 60;

export const metadata = {
  title: "Sold Archive",
  description: "Previously sold works from Fusion of the Arts.",
};

export default async function SoldPage() {
  const artworks = await getArtworks("sold");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="border-b border-zinc-200 pb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          Archive
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-light">
          Sold
        </h1>
        <p className="mt-4 text-sm text-zinc-600">
          {artworks.length} {artworks.length === 1 ? "work" : "works"} previously sold
        </p>
      </header>

      {artworks.length === 0 ? (
        <p className="mt-16 text-zinc-500 text-sm">No sold works yet.</p>
      ) : (
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {artworks.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
      )}
    </div>
  );
}
