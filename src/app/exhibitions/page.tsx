import Link from "next/link";
import Image from "next/image";
import { getExhibitions } from "@/lib/supabase/queries";
import { formatDateRange } from "@/lib/format-date";

export const revalidate = 60;

export const metadata = {
  title: "Exhibitions",
  description: "Current, upcoming, and past exhibitions at Fusion of the Arts.",
};

export default async function ExhibitionsPage() {
  const all = await getExhibitions();
  const current = all.filter((e) => e.phase === "current");
  const upcoming = all.filter((e) => e.phase === "upcoming");
  const past = all.filter((e) => e.phase === "past");

  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <header className="border-b border-zinc-200 pb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          Programme
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl tracking-tight">
          <span className="font-display italic font-light">Exhibitions</span>
        </h1>
      </header>

      {[
        { phase: "current" as const, items: current, label: "Now showing" },
        { phase: "upcoming" as const, items: upcoming, label: "Upcoming" },
        { phase: "past" as const, items: past, label: "Past" },
      ].map(
        ({ phase, items, label }) =>
          items.length > 0 && (
            <section key={phase} className="mt-16">
              <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
                {label}
              </p>
              <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
                {items.map((e) => (
                  <Link
                    key={e.id}
                    href={`/exhibitions/${e.slug}`}
                    className="group grid grid-cols-1 md:grid-cols-[160px_1fr_auto] gap-6 md:gap-10 items-start py-8 hover:bg-zinc-50/60 px-4 -mx-4 transition-colors"
                  >
                    <div className="relative aspect-square bg-zinc-100 overflow-hidden">
                      {e.hero_image_url ? (
                        <Image
                          src={e.hero_image_url}
                          alt={e.title}
                          fill
                          sizes="160px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-3xl font-display italic">
                          {e.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl tracking-tight">
                        <span className="font-display italic font-light">
                          {e.title}
                        </span>
                      </h2>
                      {e.curator && (
                        <p className="mt-2 text-sm text-zinc-600">
                          Curated by {e.curator}
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] tracking-[0.2em] uppercase text-zinc-500 whitespace-nowrap md:text-right">
                      {formatDateRange(e.starts_at, e.ends_at)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ),
      )}

      {all.length === 0 && (
        <p className="mt-16 text-zinc-500 text-sm">No exhibitions listed yet.</p>
      )}
    </div>
  );
}
