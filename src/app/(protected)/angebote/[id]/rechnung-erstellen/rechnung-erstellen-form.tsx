"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  eingabeKlasse,
  Fehlertext,
  Feld,
  PrimaryButton,
} from "@/components/ui";
import { rechnungAusAngebotErstellen } from "@/app/(protected)/rechnungen/actions";

export default function RechnungErstellenForm({
  quoteId,
  leistungsdatum: initialLeistungsdatum,
  zahlungszielTage: initialZahlungsziel,
}: {
  quoteId: string;
  leistungsdatum: string;
  zahlungszielTage: number;
}) {
  const router = useRouter();
  const [leistungsdatum, setLeistungsdatum] = useState(initialLeistungsdatum);
  const [zahlungsziel, setZahlungsziel] = useState(String(initialZahlungsziel));
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  async function absenden() {
    setFehler(undefined);
    setSpeichert(true);
    const ergebnis = await rechnungAusAngebotErstellen(
      quoteId,
      leistungsdatum,
      Number(zahlungsziel) || 14,
    );
    setSpeichert(false);
    if (ergebnis.fehler) {
      setFehler(ergebnis.fehler);
      return;
    }
    router.push(`/rechnungen/${ergebnis.id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Feld label="Leistungsdatum">
        <input
          type="date"
          value={leistungsdatum}
          onChange={(e) => setLeistungsdatum(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Zahlungsziel (Tage)">
        <input
          type="number"
          value={zahlungsziel}
          onChange={(e) => setZahlungsziel(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <Fehlertext>{fehler}</Fehlertext>
      <PrimaryButton type="button" onClick={absenden} disabled={speichert}>
        {speichert ? "Erstellt..." : "Rechnung jetzt erstellen"}
      </PrimaryButton>
    </div>
  );
}
