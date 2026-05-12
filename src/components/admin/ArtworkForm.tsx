import { Field, TextInput, NumberInput, Textarea, Select, FormSection } from "./Field";

export type ArtworkFormData = {
  slug?: string | null;
  title?: string | null;
  artist_id?: string | null;
  description?: string | null;
  medium?: string | null;
  year_created?: number | null;
  width_in?: number | string | null;
  height_in?: number | string | null;
  depth_in?: number | string | null;
  price_cents?: number | null;
  sold_price_cents?: number | null;
  status?: "draft" | "available" | "reserved" | "sold" | "archived" | null;
  ownership?: "owned" | "consignment" | null;
  consignment_split_artist_pct?: number | null;
  acquired_at?: string | null;
  sold_at?: string | null;
};

export type ArtistOption = { id: string; full_name: string };

function centsToDollars(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toString();
}

function dateOnly(value: string | null | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function ArtworkForm({
  initial,
  artists,
  action,
  submitLabel,
  currentCoverUrl,
  showSlug = false,
}: {
  initial?: ArtworkFormData;
  artists: ArtistOption[];
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  currentCoverUrl?: string | null;
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
            hint="URL fragment, e.g. art/blue-tide. Leave blank to regenerate from title."
          >
            <TextInput
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder={initial?.slug ?? "auto-generated"}
            />
          </Field>
        )}
        <Field label="Artist">
          <Select name="artist_id" required defaultValue={initial?.artist_id ?? ""}>
            <option value="" disabled>
              Select an artist
            </option>
            {artists.map((a) => (
              <option key={a.id} value={a.id}>
                {a.full_name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Description / story">
          <Textarea
            name="description"
            rows={6}
            defaultValue={initial?.description ?? ""}
          />
        </Field>
      </FormSection>

      <FormSection title="Specs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Medium">
            <TextInput
              name="medium"
              defaultValue={initial?.medium ?? ""}
              placeholder="Oil on canvas"
            />
          </Field>
          <Field label="Year">
            <NumberInput
              name="year_created"
              defaultValue={initial?.year_created ?? ""}
              placeholder="2024"
            />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-5">
          <Field label="Width (in)">
            <NumberInput
              name="width_in"
              step="0.01"
              defaultValue={initial?.width_in ?? ""}
            />
          </Field>
          <Field label="Height (in)">
            <NumberInput
              name="height_in"
              step="0.01"
              defaultValue={initial?.height_in ?? ""}
            />
          </Field>
          <Field label="Depth (in)">
            <NumberInput
              name="depth_in"
              step="0.01"
              defaultValue={initial?.depth_in ?? ""}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Pricing & status">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="List price (USD)" hint="e.g. 4500 for $4,500">
            <NumberInput
              name="price"
              step="0.01"
              defaultValue={centsToDollars(initial?.price_cents)}
              placeholder="4500"
            />
          </Field>
          <Field label="Sold price (USD)" hint="Only used when status is sold">
            <NumberInput
              name="sold_price"
              step="0.01"
              defaultValue={centsToDollars(initial?.sold_price_cents)}
              placeholder="optional"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Status">
            <Select name="status" defaultValue={initial?.status ?? "draft"}>
              <option value="draft">Draft (hidden)</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>
          <Field label="Ownership">
            <Select
              name="ownership"
              defaultValue={initial?.ownership ?? "owned"}
            >
              <option value="owned">Owned</option>
              <option value="consignment">Consignment</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Consignment split (artist %)"
          hint="Only relevant for consignment pieces. Default 60."
        >
          <NumberInput
            name="consignment_split_artist_pct"
            min={0}
            max={100}
            defaultValue={initial?.consignment_split_artist_pct ?? 60}
          />
        </Field>
      </FormSection>

      <FormSection title="Dates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Date received" hint="When you got the piece">
            <TextInput
              name="acquired_at"
              type="date"
              defaultValue={dateOnly(initial?.acquired_at)}
            />
          </Field>
          <Field label="Sold" hint="Auto-fills today when status changes to sold">
            <TextInput
              name="sold_at"
              type="date"
              defaultValue={dateOnly(initial?.sold_at)}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Cover image">
        <Field
          label="Image URL"
          hint="e.g. /artworks/12.png — file must already exist in public/artworks/."
        >
          <TextInput
            name="cover_url"
            defaultValue={currentCoverUrl ?? ""}
            placeholder="/artworks/12.png"
          />
        </Field>
        {currentCoverUrl && (
          <p className="text-xs text-zinc-500">
            Currently set to <code>{currentCoverUrl}</code>
          </p>
        )}
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
