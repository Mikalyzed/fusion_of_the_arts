import Link from "next/link";

const NAV = [
  { href: "/art", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/sold", label: "Sold" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between gap-6">
        <Link href="/" className="font-serif text-xl tracking-tight">
          Fusion of the Arts
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-700">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-zinc-950 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
