import Link from "next/link";
import type { Exhibition } from "@/lib/supabase/queries";
import { formatDateRange } from "@/lib/format-date";

export function NowShowing({ exhibition }: { exhibition: Exhibition }) {
  return (
    <section className="border-b border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-700 shrink-0">
            Now showing
          </span>
          <span className="text-zinc-300 shrink-0 hidden sm:inline">·</span>
          <span className="font-display italic text-base sm:text-lg text-zinc-900 truncate">
            {exhibition.title}
          </span>
          <span className="text-zinc-300 shrink-0 hidden md:inline">·</span>
          <span className="hidden md:inline text-xs text-zinc-600 truncate">
            {exhibition.curator && <>Curated by {exhibition.curator} · </>}
            {formatDateRange(exhibition.starts_at, exhibition.ends_at)}
          </span>
        </div>
        <Link
          href={`/exhibitions/${exhibition.slug}`}
          className="text-[10px] tracking-[0.25em] uppercase text-zinc-700 hover:text-zinc-950 whitespace-nowrap"
        >
          Visit →
        </Link>
      </div>
    </section>
  );
}
