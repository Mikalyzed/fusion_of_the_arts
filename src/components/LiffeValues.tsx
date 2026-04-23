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
    <div className="w-full">
      {/* Oversized LIFFE row */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 w-full">
        {VALUES.map((v, i) => {
          const isActive = i === selected;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              aria-label={v.title}
              aria-pressed={isActive}
              className="group relative flex-1 text-center cursor-pointer focus:outline-none"
            >
              <span
                className={`block text-6xl sm:text-8xl md:text-9xl font-light leading-none transition-colors duration-500 ${
                  isActive ? "text-zinc-900" : "text-zinc-200 group-hover:text-zinc-400"
                }`}
              >
                {v.letter}
              </span>
              <span
                className={`mt-4 block h-px mx-auto transition-all duration-500 ${
                  isActive ? "w-8 bg-zinc-900" : "w-0 bg-transparent"
                }`}
              />
              <span
                className={`mt-3 block text-[10px] tracking-[0.3em] uppercase transition-opacity duration-300 ${
                  isActive
                    ? "opacity-100 text-zinc-900"
                    : "opacity-0 group-hover:opacity-50 text-zinc-500"
                }`}
              >
                {v.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Description (re-keyed so it fades in on change) */}
      <div
        key={selected}
        className="mt-12 md:mt-16 max-w-2xl mx-auto text-center animate-fade-up"
      >
        <p className="text-zinc-700 leading-relaxed text-[15px] md:text-base">
          {value.body}
        </p>
      </div>
    </div>
  );
}
