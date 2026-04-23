export const metadata = {
  title: "Contact",
  description: "Get in touch with Fusion of the Arts.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-4xl tracking-tight">Contact</h1>
      <p className="mt-4 text-zinc-700 leading-relaxed">
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
      <p className="mt-8 text-sm text-zinc-500">
        An inquiry form is coming soon.
      </p>
    </div>
  );
}
