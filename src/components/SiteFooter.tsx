export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between text-[11px] tracking-[0.15em] uppercase text-zinc-500">
        <span>© {new Date().getFullYear()} Fusion of the Arts</span>
        <a
          href="mailto:hello@fusionofthearts.com"
          className="hover:text-zinc-950 transition-colors"
        >
          hello@fusionofthearts.com
        </a>
      </div>
    </footer>
  );
}
