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
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="border-b border-zinc-200 pb-8">
        <h1 className="font-serif text-4xl tracking-tight">Sold Archive</h1>
        <p className="mt-3 text-zinc-600">
          {artworks.length} {artworks.length === 1 ? "work" : "works"} previously sold
        </p>
      </header>

      {artworks.length === 0 ? (
        <p className="mt-12 text-zinc-500">No sold works yet.</p>
      ) : (
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artworks.map((a) => (
            <ArtworkCard key={a.id} artwork={a} />
          ))}
        </div>
      )}
    </div>
  );
}
