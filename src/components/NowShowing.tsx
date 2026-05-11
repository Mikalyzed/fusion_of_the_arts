import Link from "next/link";
import type { Exhibition } from "@/lib/supabase/queries";
import { formatDateRange } from "@/lib/format-date";

export function NowShowing({ exhibition }: { exhibition: Exhibition }) {
  return (
    <section className="border-y border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-20 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-8 md:gap-12 items-center">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-[11px] tracking-[0.3em] uppercase text-zinc-700">
            Now showing
          </span>
        </div>
        <div>
          <h2 className="text-3xl md:text-5xl tracking-tight leading-[1]">
            <span className="font-display italic font-light">
              {exhibition.title}
            </span>
          </h2>
          <p className="mt-3 text-sm text-zinc-700">
            {exhibition.curator && (
              <>
                Curated by{" "}
                <span className="text-zinc-900">{exhibition.curator}</span>
                {" · "}
              </>
            )}
            <span className="text-zinc-600">
              {formatDateRange(exhibition.starts_at, exhibition.ends_at)}
            </span>
          </p>
        </div>
        <Link
          href={`/exhibitions/${exhibition.slug}`}
          className="inline-flex items-center px-6 py-3 border border-zinc-900 text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-900 hover:text-white transition-colors whitespace-nowrap"
        >
          Visit exhibition
        </Link>
      </div>
    </section>
  );
}
