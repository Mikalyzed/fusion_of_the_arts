import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPriceCents } from "@/lib/format";

export const dynamic = "force-dynamic";

type StatusKey = "draft" | "available" | "reserved" | "sold" | "archived";

const STATUS_PILL: Record<StatusKey, string> = {
  draft: "bg-zinc-100 text-zinc-700",
  available: "bg-emerald-50 text-emerald-800",
  reserved: "bg-amber-50 text-amber-800",
  sold: "bg-zinc-900 text-white",
  archived: "bg-zinc-100 text-zinc-500",
};

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-zinc-200 p-5">
      <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-light tracking-tight text-zinc-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

const DAY_MS = 1000 * 60 * 60 * 24;

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [
    artworksRes,
    artistsRes,
    exhibitionsRes,
    recentRes,
    currentExRes,
  ] = await Promise.all([
    supabase
      .from("artworks")
      .select(
        "id, status, ownership, price_cents, sold_price_cents, consignment_split_artist_pct, acquired_at, sold_at",
      ),
    supabase.from("artists").select("id", { count: "exact", head: true }),
    supabase
      .from("exhibitions")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("artworks")
      .select(
        "id, slug, title, status, created_at, artist:artists(full_name), artwork_images(public_url, is_cover, position)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("exhibitions")
      .select(
        "id, slug, title, curator, starts_at, ends_at, exhibition_artworks(artwork_id)",
      )
      .lte("starts_at", today)
      .gte("ends_at", today)
      .eq("is_published", true)
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const artworks = (artworksRes.data ?? []) as Array<{
    id: string;
    status: StatusKey;
    ownership: "owned" | "consignment";
    price_cents: number | null;
    sold_price_cents: number | null;
    consignment_split_artist_pct: number | null;
    acquired_at: string | null;
    sold_at: string | null;
  }>;

  const counts: Record<StatusKey, number> = {
    draft: 0,
    available: 0,
    reserved: 0,
    sold: 0,
    archived: 0,
  };
  let owned = 0;
  let consignment = 0;
  let revenue = 0;
  let galleryCut = 0;
  let artistPayouts = 0;
  let sumPriceAvailable = 0;
  let priceCount = 0;
  let daysToSellSum = 0;
  let daysToSellCount = 0;
  let daysInStockSum = 0;
  let daysInStockCount = 0;
  let longestInStock = 0;

  for (const a of artworks) {
    counts[a.status]++;
    if (a.ownership === "owned") owned++;
    else consignment++;

    if (a.status === "available" && a.price_cents) {
      sumPriceAvailable += a.price_cents;
      priceCount++;
    }
    if (a.status === "sold" && a.sold_price_cents != null) {
      revenue += a.sold_price_cents;
      if (a.ownership === "consignment") {
        const artistPct = a.consignment_split_artist_pct ?? 60;
        artistPayouts += Math.round(a.sold_price_cents * (artistPct / 100));
        galleryCut += a.sold_price_cents - Math.round(a.sold_price_cents * (artistPct / 100));
      } else {
        galleryCut += a.sold_price_cents;
      }
    }
    if (a.status === "sold" && a.acquired_at && a.sold_at) {
      const days = (Date.parse(a.sold_at) - Date.parse(a.acquired_at)) / DAY_MS;
      if (Number.isFinite(days) && days >= 0) {
        daysToSellSum += days;
        daysToSellCount++;
      }
    }
    if (a.status === "available" && a.acquired_at) {
      const days = (Date.now() - Date.parse(a.acquired_at)) / DAY_MS;
      if (Number.isFinite(days) && days >= 0) {
        daysInStockSum += days;
        daysInStockCount++;
        if (days > longestInStock) longestInStock = days;
      }
    }
  }

  const totalInventory =
    counts.draft + counts.available + counts.reserved + counts.sold;
  const avgListPrice =
    priceCount > 0 ? Math.round(sumPriceAvailable / priceCount) : 0;
  const avgDaysToSell =
    daysToSellCount > 0 ? Math.round(daysToSellSum / daysToSellCount) : null;
  const avgDaysInStock =
    daysInStockCount > 0 ? Math.round(daysInStockSum / daysInStockCount) : null;

  const recent = (recentRes.data ?? []) as unknown as Array<{
    id: string;
    slug: string;
    title: string;
    status: StatusKey;
    created_at: string;
    artist: { full_name: string } | null;
    artwork_images: Array<{
      public_url: string | null;
      is_cover: boolean;
      position: number;
    }>;
  }>;

  const currentEx = currentExRes.data as
    | {
        id: string;
        slug: string;
        title: string;
        curator: string | null;
        starts_at: string;
        ends_at: string;
        exhibition_artworks: Array<{ artwork_id: string }>;
      }
    | null;

  return (
    <div>
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Overview
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2 text-[11px] tracking-[0.25em] uppercase">
          <Link
            href="/admin/artworks/new"
            className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
          >
            + Artwork
          </Link>
          <Link
            href="/admin/artists/new"
            className="px-4 py-2 border border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
          >
            + Artist
          </Link>
        </div>
      </header>

      {/* Inventory KPIs */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Total inventory" value={totalInventory} hint={`${counts.archived} archived not counted`} />
        <Kpi label="Available" value={counts.available} hint={priceCount > 0 ? `Avg list ${formatPriceCents(avgListPrice)}` : undefined} />
        <Kpi label="Sold (all-time)" value={counts.sold} hint={revenue > 0 ? `${formatPriceCents(revenue)} gross` : undefined} />
        <Kpi label="Drafts" value={counts.draft} hint={counts.draft ? "Hidden from public" : undefined} />
      </div>

      {/* Money + pipeline */}
      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi
          label="Gallery cut"
          value={formatPriceCents(galleryCut)}
          hint="Net of consignment payouts"
        />
        <Kpi
          label="Artist payouts"
          value={formatPriceCents(artistPayouts)}
          hint="From sold consignments"
        />
        <Kpi
          label="Avg days in stock"
          value={avgDaysInStock != null ? `${avgDaysInStock} d` : "—"}
          hint={
            avgDaysInStock != null
              ? `Longest: ${Math.round(longestInStock)} d`
              : "Need acquired dates"
          }
        />
        <Kpi
          label="Avg days to sell"
          value={avgDaysToSell != null ? `${avgDaysToSell} d` : "—"}
          hint={avgDaysToSell == null ? "No sales yet" : undefined}
        />
      </div>

      {/* Two-column: ownership + current exhibition */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white border border-zinc-200 p-5">
          <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-4">
            By ownership
          </p>
          <div className="flex items-baseline gap-8">
            <div>
              <p className="text-2xl font-light">{owned}</p>
              <p className="mt-1 text-xs tracking-[0.2em] uppercase text-zinc-500">
                Owned
              </p>
            </div>
            <div>
              <p className="text-2xl font-light">{consignment}</p>
              <p className="mt-1 text-xs tracking-[0.2em] uppercase text-zinc-500">
                Consignment
              </p>
            </div>
            <div className="ml-auto text-xs text-zinc-500">
              {artistsRes.count ?? 0} artist
              {(artistsRes.count ?? 0) === 1 ? "" : "s"} ·{" "}
              {exhibitionsRes.count ?? 0} exhibition
              {(exhibitionsRes.count ?? 0) === 1 ? "" : "s"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5">
          <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500 mb-4">
            Now showing
          </p>
          {currentEx ? (
            <div>
              <Link
                href={`/admin/exhibitions/${currentEx.id}`}
                className="text-lg font-display italic hover:underline underline-offset-4"
              >
                {currentEx.title}
              </Link>
              <p className="mt-1 text-xs text-zinc-500">
                {currentEx.curator && (
                  <>Curated by {currentEx.curator} · </>
                )}
                {currentEx.exhibition_artworks.length} work
                {currentEx.exhibition_artworks.length === 1 ? "" : "s"} attached
              </p>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No exhibition running.</p>
          )}
        </div>
      </div>

      {/* Recent artworks */}
      <section className="mt-8">
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-500">
            Recently added
          </p>
          <Link
            href="/admin/artworks"
            className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 hover:text-zinc-900"
          >
            All artworks →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500">No artworks yet.</p>
        ) : (
          <div className="bg-white border border-zinc-200">
            {recent.map((r, i) => {
              const cover =
                r.artwork_images.find((img) => img.is_cover) ??
                [...r.artwork_images].sort((a, b) => a.position - b.position)[0];
              return (
                <Link
                  key={r.id}
                  href={`/admin/artworks/${r.id}`}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-zinc-50 ${
                    i > 0 ? "border-t border-zinc-100" : ""
                  }`}
                >
                  <div className="relative w-12 h-12 bg-zinc-100 shrink-0 overflow-hidden">
                    {cover?.public_url && (
                      <Image
                        src={cover.public_url}
                        alt={r.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{r.title}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {r.artist?.full_name ?? "—"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] tracking-[0.2em] uppercase px-2 py-0.5 ${STATUS_PILL[r.status]}`}
                  >
                    {r.status}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Coming soon */}
      <section className="mt-12 border-t border-zinc-200 pt-6">
        <p className="text-[10px] tracking-[0.25em] uppercase text-zinc-400 mb-3">
          Coming soon
        </p>
        <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
          Page views per artwork · Inquiries inbox · Sold timeline ·
          Monthly revenue chart · Top-performing artists by sales.
          Most require a couple of tracking hooks on the public site —
          tell me when you want them and I&apos;ll add them.
        </p>
      </section>
    </div>
  );
}
