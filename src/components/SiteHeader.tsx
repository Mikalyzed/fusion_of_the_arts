import Link from "next/link";
import Image from "next/image";

const NAV = [
  { href: "/art", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/sold", label: "Sold" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-6">
        <Link href="/" aria-label="Fusion of the Arts — home" className="block">
          <Image
            src="/logo.svg"
            alt="Fusion of the Arts"
            width={130}
            height={40}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav className="flex items-center gap-8">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] tracking-[0.2em] uppercase text-zinc-600 hover:text-zinc-950 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
