"use client";

import { useState } from "react";
import type { CompanySettings } from "@/types/database";
import { eingabeKlasse, Feld, PrimaryButton, SecondaryButton } from "@/components/ui";
import { summen } from "@/lib/calc";
import { erzeugeCsv, csvHerunterladen, zahlFuerCsv } from "@/lib/csv";
import { erzeugeRechnungsSammlungPdf } from "@/lib/pdf/rechnungssammlung";
import { holeRechnungenDesMonats } from "./actions";

const statusLabel = {
  offen: "Offen",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
} as const;

function monatJahrAusEingabe(wert: string): { jahr: number; monat: number } {
  const [jahr, monat] = wert.split("-").map(Number);
  return { jahr, monat };
}

export default function ExportForm({ firma }: { firma: CompanySettings }) {
  const [monatWert, setMonatWert] = useState(new Date().toISOString().slice(0, 7));
  const [status, setStatus] = useState<string>();
  const [laedt, setLaedt] = useState(false);

  async function alsPdf() {
    setStatus(undefined);
    setLaedt(true);
    const { jahr, monat } = monatJahrAusEingabe(monatWert);
    const rechnungen = await holeRechnungenDesMonats(jahr, monat);
    setLaedt(false);
    if (!rechnungen.length) {
      setStatus("Keine Rechnungen in diesem Monat gefunden.");
      return;
    }
    erzeugeRechnungsSammlungPdf(firma, rechnungen, `Rechnungen-${monatWert}.pdf`);
  }

  async function alsCsv() {
    setStatus(undefined);
    setLaedt(true);
    const { jahr, monat } = monatJahrAusEingabe(monatWert);
    const rechnungen = await holeRechnungenDesMonats(jahr, monat);
    setLaedt(false);
    if (!rechnungen.length) {
      setStatus("Keine Rechnungen in diesem Monat gefunden.");
      return;
    }

    const zeilen = rechnungen.map(({ rechnung, kunde }) => {
      const { netto, mwst, brutto } = summen(rechnung.summe_netto, rechnung.mwst_satz);
      return [
        rechnung.nummer,
        rechnung.rechnungsdatum.split("-").reverse().join("."),
        kunde.name,
        zahlFuerCsv(netto),
        zahlFuerCsv(mwst),
        zahlFuerCsv(brutto),
        statusLabel[rechnung.status],
      ];
    });

    const csv = erzeugeCsv(
      ["Nummer", "Datum", "Kunde", "Netto", "MwSt.", "Brutto", "Status"],
      zeilen,
    );
    csvHerunterladen(csv, `Rechnungen-${monatWert}.csv`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Feld label="Monat">
        <input
          type="month"
          value={monatWert}
          onChange={(e) => setMonatWert(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>

      {status && <p className="text-sm font-medium text-amber-700">{status}</p>}

      <PrimaryButton type="button" onClick={alsPdf} disabled={laedt}>
        {laedt ? "Lädt..." : "📄 Als PDF-Sammlung herunterladen"}
      </PrimaryButton>
      <SecondaryButton type="button" onClick={alsCsv} disabled={laedt}>
        {laedt ? "Lädt..." : "📊 Als CSV herunterladen"}
      </SecondaryButton>
    </div>
  );
}
