export const metadata = {
  title: "Contact",
  description: "Get in touch with Fusion of the Arts.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
        Get in touch
      </p>
      <h1 className="mt-3 text-4xl md:text-5xl tracking-tight font-light">
        Contact
      </h1>
      <p className="mt-8 text-zinc-700 leading-relaxed">
        Questions about a piece, visiting the gallery, or consigning your work?
        Reach us by email.
      </p>
      <p className="mt-4">
        <a
          href="mailto:hello@fusionofthearts.com"
          className="text-zinc-900 underline underline-offset-4 hover:text-zinc-600"
        >
          hello@fusionofthearts.com
        </a>
      </p>
      <p className="mt-12 text-[11px] tracking-[0.25em] uppercase text-zinc-400">
        Inquiry form coming soon
      </p>
    </div>
  );
}
