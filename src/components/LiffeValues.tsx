"use client";

import { useState } from "react";

const VALUES = [
  {
    letter: "L",
    title: "Love",
    body:
      "Love for the craft drives every artist we represent — and shapes how we introduce their work to the people who live with it.",
  },
  {
    letter: "I",
    title: "Integrity",
    body:
      "Every piece arrives with honest provenance, honest pricing, and honest conversation about why it exists.",
  },
  {
    letter: "F",
    title: "Faith",
    body:
      "Faith in an artist's vision — especially early, before the work has met its audience — is the core of what a gallery is for.",
  },
  {
    letter: "F",
    title: "Family",
    body:
      "Relationships with our artists and collectors that outlast any single sale. We are in this for the long run.",
  },
  {
    letter: "E",
    title: "Excellence",
    body:
      "A rigorous eye on every piece we choose to represent, and on every detail of how we deliver it to you.",
  },
];

export function LiffeValues() {
  const [selected, setSelected] = useState(0);
  const value = VALUES[selected];

  return (
    <div>
      <div className="flex items-end gap-6 sm:gap-10 md:gap-14">
        {VALUES.map((v, i) => {
          const isActive = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={isActive}
              aria-label={v.title}
              className={`relative text-5xl sm:text-6xl md:text-7xl font-light leading-none transition-colors cursor-pointer focus:outline-none ${
                isActive
                  ? "text-zinc-900"
                  : "text-zinc-300 hover:text-zinc-500"
              }`}
            >
              {v.letter}
              <span
                className={`absolute -bottom-3 left-0 right-0 h-px transition-colors ${
                  isActive ? "bg-zinc-900" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="mt-12 min-h-[7rem] max-w-2xl">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          {value.title}
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed text-[15px]">
          {value.body}
        </p>
      </div>
    </div>
  );
}
