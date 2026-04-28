import Link from "next/link";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { createArtist } from "@/lib/actions/artists";

export default function NewArtistPage() {
  return (
    <div>
      <Link
        href="/admin/artists"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Artists
      </Link>
      <h1 className="mt-3 text-3xl tracking-tight font-light">New artist</h1>
      <p className="mt-2 text-zinc-600 text-sm">
        Only the name is required. Bio, contact, and links can be added later.
      </p>
      <div className="mt-8">
        <ArtistForm action={createArtist} submitLabel="Create artist" />
      </div>
    </div>
  );
}
