import Link from "next/link";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-50 min-h-[calc(100vh-160px)]">
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-8">
          <Link
            href="/admin"
            className="text-[11px] tracking-[0.25em] uppercase font-medium"
          >
            Admin
          </Link>
          <nav className="flex items-center gap-6 text-[11px] tracking-[0.2em] uppercase text-zinc-600">
            <Link href="/admin/artworks" className="hover:text-zinc-950">
              Artworks
            </Link>
          </nav>
          <span className="ml-auto text-[10px] tracking-[0.2em] uppercase text-amber-700">
            Localhost only — no auth yet
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-10">{children}</div>
    </div>
  );
}
