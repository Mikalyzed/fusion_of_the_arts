import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminArtistRow = {
  id: string;
  slug: string;
  full_name: string;
  photo_url: string | null;
  email: string | null;
  artworks: Array<{ id: string }>;
};

export default async function AdminArtistsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("artists")
    .select("id, slug, full_name, photo_url, email, artworks(id)")
    .order("full_name", { ascending: true });

  if (error) {
    return <p className="text-red-700">Failed to load: {error.message}</p>;
  }

  const artists = (data ?? []) as unknown as AdminArtistRow[];

  return (
    <div>
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
            Roster
          </p>
          <h1 className="mt-2 text-3xl tracking-tight font-light">
            Artists ({artists.length})
          </h1>
        </div>
        <Link
          href="/admin/artists/new"
          className="px-5 py-2.5 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors"
        >
          + New artist
        </Link>
      </header>

      {artists.length === 0 ? (
        <p className="mt-12 text-zinc-500 text-sm">No artists yet.</p>
      ) : (
        <div className="mt-8 bg-white border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr className="text-left text-[10px] tracking-[0.2em] uppercase text-zinc-500">
                <th className="py-3 pl-4 pr-2 w-16"></th>
                <th className="py-3 px-2">Name</th>
                <th className="py-3 px-2">Slug</th>
                <th className="py-3 px-2">Email</th>
                <th className="py-3 px-2 text-right">Works</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {artists.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                >
                  <td className="py-2 pl-4 pr-2">
                    <div className="relative w-10 h-10 bg-zinc-100 rounded-full overflow-hidden">
                      {a.photo_url ? (
                        <Image
                          src={a.photo_url}
                          alt={a.full_name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs">
                          {a.full_name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <Link
                      href={`/admin/artists/${a.id}`}
                      className="font-medium text-zinc-900 hover:underline underline-offset-4"
                    >
                      {a.full_name}
                    </Link>
                  </td>
                  <td className="py-2 px-2 text-zinc-500 text-xs">/{a.slug}</td>
                  <td className="py-2 px-2 text-zinc-700">{a.email ?? "—"}</td>
                  <td className="py-2 px-2 text-right text-zinc-700">
                    {a.artworks.length}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <Link
                      href={`/admin/artists/${a.id}`}
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
