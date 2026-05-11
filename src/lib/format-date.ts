const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function parseISODate(d: string) {
  // Date-only strings ("2026-04-18") — avoid timezone surprises.
  const [year, month, day] = d.split("-").map(Number);
  return { year, month, day };
}

export function formatLongDate(d: string): string {
  const { year, month, day } = parseISODate(d);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISODate(start);
  const e = parseISODate(end);
  if (s.year === e.year && s.month === e.month) {
    return `${MONTHS[s.month - 1]} ${s.day} – ${e.day}, ${s.year}`;
  }
  if (s.year === e.year) {
    return `${MONTHS[s.month - 1]} ${s.day} – ${MONTHS[e.month - 1]} ${e.day}, ${s.year}`;
  }
  return `${MONTHS[s.month - 1]} ${s.day}, ${s.year} – ${MONTHS[e.month - 1]} ${e.day}, ${e.year}`;
}
