export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-zinc-500 flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
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
