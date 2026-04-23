import Link from "next/link";
import Image from "next/image";
import { formatPriceCents } from "@/lib/format";
import type { ArtworkCardData } from "@/lib/supabase/queries";

export function ArtworkCard({ artwork }: { artwork: ArtworkCardData }) {
  const isSold = artwork.status === "sold";

  return (
    <Link href={`/art/${artwork.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
        {artwork.cover?.public_url ? (
          <Image
            src={artwork.cover.public_url}
            alt={artwork.cover.alt_text ?? artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs tracking-widest uppercase">
            No image
          </div>
        )}
        {isSold && (
          <span className="absolute top-4 left-4 bg-white text-zinc-900 text-[10px] tracking-[0.25em] uppercase px-2.5 py-1">
            Sold
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-[15px] leading-tight text-zinc-900 group-hover:underline underline-offset-4 decoration-zinc-300">
          {artwork.title}
        </h3>
        <p className="text-[13px] text-zinc-500 mt-1">
          {artwork.artist.full_name}
        </p>
        <p className="text-[12px] tracking-[0.1em] uppercase text-zinc-700 mt-3">
          {isSold ? "Sold" : formatPriceCents(artwork.price_cents)}
        </p>
      </div>
    </Link>
  );
}
