// Deutsche Formatierung für Beträge und Datumsangaben.

export function formatEuro(betrag: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(betrag);
}

export function formatZahl(wert: number, nachkommastellen = 2): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: nachkommastellen,
  }).format(wert);
}

export function formatDatum(datum: string | Date | null | undefined): string {
  if (!datum) return "";
  const d = typeof datum === "string" ? new Date(datum) : datum;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function heuteISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function datumPlusTage(startISO: string, tage: number): string {
  const d = new Date(startISO);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}
