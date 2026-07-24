// Preisberechnung für Positionen (Katalog & Angebot/Rechnung).

export function einzelpreis(
  zeitStunden: number,
  stundensatz: number,
  materialPreis: number,
): number {
  return round2(zeitStunden * stundensatz + materialPreis);
}

export function round2(wert: number): number {
  return Math.round((wert + Number.EPSILON) * 100) / 100;
}

export interface Summen {
  netto: number;
  mwst: number;
  brutto: number;
}

export function summen(nettoGesamt: number, mwstSatz: number): Summen {
  const netto = round2(nettoGesamt);
  const mwst = round2(netto * (mwstSatz / 100));
  const brutto = round2(netto + mwst);
  return { netto, mwst, brutto };
}
