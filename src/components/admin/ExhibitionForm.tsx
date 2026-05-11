import { Field, TextInput, Textarea, FormSection } from "./Field";

export type ExhibitionFormData = {
  slug?: string | null;
  title?: string | null;
  curator?: string | null;
  collaboration?: string | null;
  statement?: string | null;
  hero_image_url?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_published?: boolean | null;
};

export function ExhibitionForm({
  initial,
  action,
  submitLabel,
  showSlug = false,
}: {
  initial?: ExhibitionFormData;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  showSlug?: boolean;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <FormSection title="Identity">
        <Field label="Title">
          <TextInput
            name="title"
            required
            defaultValue={initial?.title ?? ""}
          />
        </Field>
        {showSlug && (
          <Field
            label="Slug"
            hint="URL fragment, e.g. exhibitions/sin-reversa-2. Leave blank to regenerate."
          >
            <TextInput
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder={initial?.slug ?? "auto-generated"}
            />
          </Field>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Curator">
            <TextInput
              name="curator"
              defaultValue={initial?.curator ?? ""}
              placeholder="e.g. Disem"
            />
          </Field>
          <Field label="Collaboration note">
            <TextInput
              name="collaboration"
              defaultValue={initial?.collaboration ?? ""}
              placeholder="e.g. In collaboration with…"
            />
          </Field>
        </div>
        <Field label="Statement">
          <Textarea
            name="statement"
            rows={8}
            defaultValue={initial?.statement ?? ""}
            placeholder="A paragraph or two about the show."
          />
        </Field>
        <Field
          label="Hero image URL"
          hint="e.g. /artworks/hero.jpg — file must already exist in public/artworks/."
        >
          <TextInput
            name="hero_image_url"
            defaultValue={initial?.hero_image_url ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection title="Dates & visibility">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Start date">
            <TextInput
              name="starts_at"
              type="date"
              required
              defaultValue={initial?.starts_at ?? ""}
            />
          </Field>
          <Field label="End date">
            <TextInput
              name="ends_at"
              type="date"
              required
              defaultValue={initial?.ends_at ?? ""}
            />
          </Field>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="is_published"
            defaultChecked={initial?.is_published ?? false}
            className="h-4 w-4"
          />
          <span className="text-sm text-zinc-700">
            Published (visible to the public)
          </span>
        </label>
      </FormSection>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-7 py-3 bg-zinc-900 text-white text-[11px] tracking-[0.25em] uppercase hover:bg-zinc-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
