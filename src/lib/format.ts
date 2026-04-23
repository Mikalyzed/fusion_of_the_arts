export function formatPriceCents(cents: number | null | undefined): string {
  if (cents == null) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
  depth: number | null | undefined,
): string | null {
  const hasWH = width != null && height != null;
  if (!hasWH) return null;
  const base = `${width} × ${height}`;
  const withDepth = depth != null ? `${base} × ${depth}` : base;
  return `${withDepth} in`;
}
