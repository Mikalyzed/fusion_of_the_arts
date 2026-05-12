"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState, type ReactNode } from "react";

export function SubmitButton({
  children,
  savingLabel = "Saving…",
}: {
  children: ReactNode;
  savingLabel?: string;
}) {
  const { pending } = useFormStatus();
  const [justSaved, setJustSaved] = useState(false);
  const [wasPending, setWasPending] = useState(false);

  useEffect(() => {
    if (pending) {
      setWasPending(true);
      setJustSaved(false);
      return;
    }
    if (wasPending) {
      setJustSaved(true);
      setWasPending(false);
      const t = setTimeout(() => setJustSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [pending, wasPending]);

  return (
    <div className="flex items-center gap-4">
      <span
        aria-live="polite"
        className={`text-[10px] tracking-[0.25em] uppercase text-emerald-700 transition-opacity duration-300 ${
          justSaved ? "opacity-100" : "opacity-0"
        }`}
      >
        ✓ Saved
      </span>
      <button
        type="submit"
        disabled={pending}
        className="px-7 py-3 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
      >
        {pending ? savingLabel : children}
      </button>
    </div>
  );
}
