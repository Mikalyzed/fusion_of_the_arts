import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateRange } from "@/lib/format-date";

type AdminExhibitionRow = {
  id: string;
  slug: string;
  title: string;
  curator: string | null;
  starts_at: string;
  ends_at: string;
  is_published: boolean;
  exhibition_artworks: Array<{ artwork_id: string }>;
};

export default async function AdminExhibitionsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("exhibitions")
    .select(
      "id, slug, title, curator, starts_at, ends_at, is_published, exhibition_artworks(artwork_id)",
    )
    .order("starts_at", { ascending: false });

  if (error) return <p className="text-red-700">Failed: {error.message}</p>;

  const exhibitions = (data ?? []) as unknown as AdminExhibitionRow[];

  return (
    <div>
      <header className="flex items-end justify-between gap-6">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Programme
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            Exhibitions ({exhibitions.length})
          </h1>
        </div>
        <Link
          href="/admin/exhibitions/new"
          className="px-5 py-2.5 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors"
        >
          + New exhibition
        </Link>
      </header>

      {exhibitions.length === 0 ? (
        <p className="mt-12 text-zinc-500 text-sm">No exhibitions yet.</p>
      ) : (
        <div className="mt-8 bg-white border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-zinc-500">
                <th className="py-3 pl-4 pr-2">Title</th>
                <th className="py-3 px-2">Curator</th>
                <th className="py-3 px-2">Dates</th>
                <th className="py-3 px-2 text-right">Works</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {exhibitions.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                >
                  <td className="py-3 pl-4 pr-2">
                    <Link
                      href={`/admin/exhibitions/${e.id}`}
                      className="font-medium text-zinc-900 hover:underline underline-offset-4"
                    >
                      {e.title}
                    </Link>
                    <div className="text-xs text-zinc-500">/{e.slug}</div>
                  </td>
                  <td className="py-3 px-2 text-zinc-700">{e.curator ?? "—"}</td>
                  <td className="py-3 px-2 text-zinc-700">
                    {formatDateRange(e.starts_at, e.ends_at)}
                  </td>
                  <td className="py-3 px-2 text-right text-zinc-700">
                    {e.exhibition_artworks.length}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 ${
                        e.is_published
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {e.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/exhibitions/${e.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 underline-offset-4 hover:underline"
                    >
                      edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
