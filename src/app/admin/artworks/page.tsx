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

type View = "table" | "grid";

function coverOf(a: AdminArtworkRow): string | null {
  const c =
    a.artwork_images.find((img) => img.is_cover) ??
    [...a.artwork_images].sort((x, y) => x.position - y.position)[0];
  return c?.public_url ?? null;
}

export default async function AdminArtworksPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view: viewParam } = await searchParams;
  const view: View = viewParam === "grid" ? "grid" : "table";

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
      <header className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Inventory
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            Artworks ({artworks.length})
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-2 text-[10px] tracking-[0.2em] uppercase">
            {(
              ["draft", "available", "reserved", "sold", "archived"] as const
            ).map((s) =>
              counts[s] ? (
                <span key={s} className={`px-2 py-1 ${STATUS_COLOR[s]}`}>
                  {s} · {counts[s]}
                </span>
              ) : null,
            )}
          </div>
          <div className="inline-flex border border-zinc-300 text-[10px] tracking-[0.2em] uppercase">
            <Link
              href="/admin/artworks?view=table"
              className={
                view === "table"
                  ? "bg-zinc-900 text-white px-3 py-1.5"
                  : "px-3 py-1.5 text-zinc-600 hover:text-zinc-900"
              }
            >
              Table
            </Link>
            <Link
              href="/admin/artworks?view=grid"
              className={
                view === "grid"
                  ? "bg-zinc-900 text-white px-3 py-1.5"
                  : "px-3 py-1.5 text-zinc-600 hover:text-zinc-900"
              }
            >
              Grid
            </Link>
          </div>
          <Link
            href="/admin/artworks/new"
            className="px-5 py-2.5 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors whitespace-nowrap"
          >
            + New artwork
          </Link>
        </div>
      </header>

      {artworks.length === 0 ? (
        <p className="mt-12 text-zinc-500 text-sm">
          No artworks yet. Drop images in <code>public/artworks/</code> and run{" "}
          <code>npm run import-art</code>.
        </p>
      ) : view === "grid" ? (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {artworks.map((a) => {
            const cover = coverOf(a);
            return (
              <Link
                key={a.id}
                href={`/admin/artworks/${a.id}`}
                className="group block"
              >
                <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                  {cover && (
                    <Image
                      src={cover}
                      alt={a.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover"
                    />
                  )}
                  <span
                    className={`absolute top-2 left-2 text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 ${STATUS_COLOR[a.status]}`}
                  >
                    {a.status}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-zinc-900 truncate group-hover:underline underline-offset-4 decoration-zinc-300">
                    {a.title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {a.artist?.full_name ?? "—"}
                  </p>
                  <p className="text-xs text-zinc-700 mt-1.5 tracking-wide">
                    {a.price_cents != null
                      ? formatPriceCents(a.price_cents)
                      : "—"}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
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
                const cover = coverOf(a);
                return (
                  <tr
                    key={a.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="py-2 pl-4 pr-2">
                      <div className="relative w-14 h-14 bg-zinc-100">
                        {cover && (
                          <Image
                            src={cover}
                            alt={a.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Link
                        href={`/admin/artworks/${a.id}`}
                        className="font-medium text-zinc-900 hover:underline underline-offset-4"
                      >
                        {a.title}
                      </Link>
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
                        href={`/admin/artworks/${a.id}`}
                        className="text-xs text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline"
                      >
                        edit
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
