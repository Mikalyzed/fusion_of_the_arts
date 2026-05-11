import Link from "next/link";
import { ExhibitionForm } from "@/components/admin/ExhibitionForm";
import { createExhibition } from "@/lib/actions/exhibitions";

export default function NewExhibitionPage() {
  return (
    <div>
      <Link
        href="/admin/exhibitions"
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 hover:text-zinc-900"
      >
        ← Exhibitions
      </Link>
      <h1 className="mt-3 text-3xl tracking-tight font-light">New exhibition</h1>
      <p className="mt-2 text-zinc-600 text-sm">
        Title, start, and end dates are required. You can attach artworks after
        creating it.
      </p>
      <div className="mt-8">
        <ExhibitionForm
          action={createExhibition}
          submitLabel="Create exhibition"
        />
      </div>
    </div>
  );
}
