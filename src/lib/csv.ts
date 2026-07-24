// CSV im deutschen Format (Semikolon als Trenner, Komma als Dezimaltrennzeichen)
// für die direkte Weiterverarbeitung z.B. in Excel.

function feldEscapen(wert: string): string {
  if (wert.includes(";") || wert.includes('"') || wert.includes("\n")) {
    return '"' + wert.replace(/"/g, '""') + '"';
  }
  return wert;
}

export function zahlFuerCsv(wert: number): string {
  return wert.toFixed(2).replace(".", ",");
}

export function erzeugeCsv(kopfzeile: string[], zeilen: string[][]): string {
  const alle = [kopfzeile, ...zeilen];
  return alle.map((zeile) => zeile.map(feldEscapen).join(";")).join("\r\n");
}

export function csvHerunterladen(inhalt: string, dateiname: string): void {
  const blob = new Blob(["﻿" + inhalt], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = dateiname;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
