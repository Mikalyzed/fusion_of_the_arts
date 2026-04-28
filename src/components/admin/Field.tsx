import type { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const baseInput =
  "w-full border border-zinc-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-zinc-900 transition-colors";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] tracking-[0.2em] uppercase text-zinc-600 mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block mt-1 text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInput} ${props.className ?? ""}`} />;
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="number"
      {...props}
      className={`${baseInput} ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${baseInput} min-h-[6rem] ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${baseInput} appearance-none ${props.className ?? ""}`}
    />
  );
}

export function FormSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white border border-zinc-200 p-6">
      {title && (
        <h2 className="text-[11px] tracking-[0.25em] uppercase text-zinc-700 mb-5">
          {title}
        </h2>
      )}
      <div className="space-y-5">{children}</div>
    </section>
  );
}
