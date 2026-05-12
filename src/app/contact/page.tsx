import { ContactForm } from "@/components/ContactForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Fusion of the Arts.",
};

type SP = { artwork?: string };

async function lookupArtworkTitle(slug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("artworks")
    .select("title")
    .eq("slug", slug)
    .in("status", ["available", "sold"])
    .maybeSingle();
  return (data?.title as string | null) ?? null;
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const artworkSlug = sp.artwork ?? undefined;
  const artworkTitle = artworkSlug
    ? await lookupArtworkTitle(artworkSlug)
    : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
        Get in touch
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-light">
        Contact
      </h1>
      <p className="mt-6 text-zinc-700 leading-relaxed">
        Inquire about a piece, schedule a visit, submit your work for
        consignment, or just say hi. Or email us directly at{" "}
        <a
          href="mailto:hello@fusionofthearts.com"
          className="text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
        >
          hello@fusionofthearts.com
        </a>
        .
      </p>

      <div className="mt-12">
        <ContactForm
          artworkSlug={artworkSlug}
          artworkTitle={artworkTitle ?? undefined}
        />
      </div>
    </div>
  );
}
