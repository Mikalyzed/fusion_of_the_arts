import { Fragment } from "react";

const ITEMS = [
  "Original art",
  "By appointment",
  "Curated collection",
  "Worldwide delivery",
  "Est. MMXXVI",
  "Painters · sculptors · mixed media",
];

function Strip() {
  return (
    <div className="flex items-center shrink-0">
      {ITEMS.map((item, i) => (
        <Fragment key={i}>
          <span className="px-8 text-[11px] tracking-[0.3em] uppercase">
            {item}
          </span>
          <span aria-hidden className="text-zinc-500 text-xs">
            ◆
          </span>
        </Fragment>
      ))}
    </div>
  );
}

export function Marquee() {
  return (
    <section className="bg-zinc-900 text-white overflow-hidden border-y border-zinc-900">
      <div className="flex animate-marquee py-4 whitespace-nowrap">
        <Strip />
        <Strip />
      </div>
    </section>
  );
}
