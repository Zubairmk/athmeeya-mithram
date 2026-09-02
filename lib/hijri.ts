const HIJRI_MONTHS_ML = [
  "മുഹറം",
  "സ്വഫർ",
  "റബീഉൽ അവ്വൽ",
  "റബീഉൽ ആഖിർ",
  "ജമാദുൽ ഊലാ",
  "ജമാദുൽ ആഖിറ",
  "റജബ്",
  "ശഅ്ബാൻ",
  "റമളാൻ",
  "ശവ്വാൽ",
  "ദുൽഖഅദ്",
  "ദുൽഹിജ്ജ",
];

// Approximate: based on ICU's umalqura calendar, which can differ from local
// moon-sighting announcements by a day. Good enough for a UI date label.
export function formatHijriDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const month = Number(parts.find((p) => p.type === "month")?.value ?? "1");
  const year = parts.find((p) => p.type === "year")?.value ?? "";

  return `${day} ${HIJRI_MONTHS_ML[month - 1] ?? ""} ${year}`.trim();
}
