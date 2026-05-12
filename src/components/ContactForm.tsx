"use client";

import { useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";

export function ContactForm({
  artworkSlug,
  artworkTitle,
}: {
  artworkSlug?: string;
  artworkTitle?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (done) {
    return (
      <div className="border border-zinc-200 bg-white p-8 text-center">
        <p className="text-[11px] tracking-[0.3em] uppercase text-zinc-500">
          Sent
        </p>
        <p className="mt-3 text-zinc-800 leading-relaxed">
          Thanks for reaching out. We&apos;ll be back to you within a day or two.
        </p>
      </div>
    );
  }

  return (
    <form
      action={(formData) => {
        setError(null);
        startTransition(async () => {
          try {
            await submitInquiry(formData);
            setDone(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Something went wrong");
          }
        });
      }}
      className="space-y-5"
    >
      {artworkSlug && (
        <div className="bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-700">
          Inquiring about{" "}
          <span className="font-medium text-zinc-900">
            {artworkTitle ?? artworkSlug}
          </span>
          <input type="hidden" name="artwork_slug" value={artworkSlug} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-1.5">
            Name
          </span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            className="w-full border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-1.5">
            Email
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
          />
        </label>
      </div>

      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-1.5">
          Phone <span className="text-zinc-400 normal-case tracking-normal">(optional)</span>
        </span>
        <input
          type="tel"
          name="phone"
          autoComplete="tel"
          className="w-full border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
        />
      </label>

      <label className="block">
        <span className="block text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-1.5">
          Message
        </span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder={
            artworkSlug
              ? "Anything you'd like to know about the piece, or how to come see it..."
              : "Tell us a little about what you're after — a specific piece, an artist, a visit, or just say hi."
          }
          className="w-full border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900"
        />
      </label>

      {/* Honeypot — humans don't fill this, bots do */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-zinc-500">
          We read every message and reply personally.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="px-7 py-3 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
        >
          {pending ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
