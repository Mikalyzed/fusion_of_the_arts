import { Field, TextInput, Textarea, FormSection } from "./Field";
import { SubmitButton } from "./SubmitButton";

export type ArtistFormData = {
  slug?: string | null;
  full_name?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  website?: string | null;
  instagram?: string | null;
  email?: string | null;
  phone?: string | null;
  notes?: string | null;
};

export function ArtistForm({
  initial,
  action,
  submitLabel,
  showSlug = false,
}: {
  initial?: ArtistFormData;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  showSlug?: boolean;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <FormSection title="Identity">
        <Field label="Full name">
          <TextInput
            name="full_name"
            required
            defaultValue={initial?.full_name ?? ""}
          />
        </Field>
        {showSlug && (
          <Field
            label="Slug"
            hint="URL fragment, e.g. artists/jane-doe. Leave blank to regenerate from name."
          >
            <TextInput
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder={initial?.slug ?? "auto-generated"}
            />
          </Field>
        )}
        <Field label="Bio">
          <Textarea
            name="bio"
            defaultValue={initial?.bio ?? ""}
            rows={5}
          />
        </Field>
        <Field label="Photo URL" hint="e.g. /artworks/portrait.jpg or a full URL">
          <TextInput
            name="photo_url"
            defaultValue={initial?.photo_url ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection title="Contact & links">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Email">
            <TextInput
              name="email"
              type="email"
              defaultValue={initial?.email ?? ""}
            />
          </Field>
          <Field label="Phone">
            <TextInput name="phone" defaultValue={initial?.phone ?? ""} />
          </Field>
          <Field label="Website">
            <TextInput
              name="website"
              defaultValue={initial?.website ?? ""}
              placeholder="https://"
            />
          </Field>
          <Field label="Instagram handle" hint="just the handle, no @">
            <TextInput
              name="instagram"
              defaultValue={initial?.instagram ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Internal notes">
        <Field
          label="Notes (admin only)"
          hint="Never shown publicly. For commission terms, contact preferences, etc."
        >
          <Textarea name="notes" defaultValue={initial?.notes ?? ""} rows={4} />
        </Field>
      </FormSection>

      <div className="flex justify-end">
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
