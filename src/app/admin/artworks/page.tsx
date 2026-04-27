import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPriceCents } from "@/lib/format";

type ArtistRel = { slug: string; full_name: string } | null;

type AdminArtworkRow = {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "available" | "reserved" | "sold" | "archived";
  ownership: "owned" | "consignment";
  price_cents: number | null;
  created_at: string;
  artist: ArtistRel;
  artwork_images: Array<{
    public_url: string | null;
    is_cover: boolean;
    position: number;
  }>;
};

const STATUS_COLOR: Record<AdminArtworkRow["status"], string> = {
  draft: "bg-amber-100 text-amber-900",
  available: "bg-emerald-100 text-emerald-900",
  reserved: "bg-sky-100 text-sky-900",
  sold: "bg-zinc-900 text-white",
  archived: "bg-zinc-200 text-zinc-700",
};

export default async function AdminArtworksPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("artworks")
    .select(
      `
      id, slug, title, status, ownership, price_cents, created_at,
      artist:artists(slug, full_name),
      artwork_images(public_url, is_cover, position)
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-light tracking-tight">Artworks</h1>
        <p className="mt-4 text-red-700">Failed to load: {error.message}</p>
      </div>
    );
  }

  const artworks = (data ?? []) as unknown as AdminArtworkRow[];
  const counts = artworks.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Inventory
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            Artworks ({artworks.length})
          </h1>
        </div>
        <div className="flex gap-2 text-[10px] tracking-[0.2em] uppercase">
          {(
            ["draft", "available", "reserved", "sold", "archived"] as const
          ).map((s) =>
            counts[s] ? (
              <span
                key={s}
                className={`px-2 py-1 ${STATUS_COLOR[s]}`}
              >
                {s} · {counts[s]}
              </span>
            ) : null,
          )}
        </div>
      </header>

      {artworks.length === 0 ? (
        <p className="mt-12 text-zinc-500 text-sm">
          No artworks yet. Drop images in <code>public/artworks/</code> and run{" "}
          <code>npm run import-art</code>.
        </p>
      ) : (
        <div className="mt-8 bg-white border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-zinc-500">
                <th className="py-3 pl-4 pr-2 w-20"></th>
                <th className="py-3 px-2">Title / slug</th>
                <th className="py-3 px-2">Artist</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Ownership</th>
                <th className="py-3 px-2 text-right">Price</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {artworks.map((a) => {
                const cover =
                  a.artwork_images.find((img) => img.is_cover) ??
                  [...a.artwork_images].sort(
                    (x, y) => x.position - y.position,
                  )[0];
                return (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="py-2 pl-4 pr-2">
                      <div className="relative w-14 h-14 bg-zinc-100">
                        {cover?.public_url && (
                          <Image
                            src={cover.public_url}
                            alt={a.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-medium text-zinc-900">{a.title}</div>
                      <div className="text-xs text-zinc-500">/{a.slug}</div>
                    </td>
                    <td className="py-2 px-2 text-zinc-700">
                      {a.artist?.full_name ?? "—"}
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${STATUS_COLOR[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-zinc-700 capitalize">
                      {a.ownership}
                    </td>
                    <td className="py-2 px-2 text-right text-zinc-700">
                      {a.price_cents != null
                        ? formatPriceCents(a.price_cents)
                        : "—"}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <Link
                        href={`/art/${a.slug}`}
                        target="_blank"
                        className="text-xs text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline"
                      >
                        view
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
