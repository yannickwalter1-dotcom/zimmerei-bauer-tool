"use client";

import { useActionState, useMemo, useState } from "react";
import type { CatalogItem } from "@/types/database";
import {
  eingabeKlasse,
  Fehlertext,
  Feld,
  PrimaryButton,
  selectKlasse,
} from "@/components/ui";
import { einzelpreis } from "@/lib/calc";
import { formatEuro } from "@/lib/format";
import type { KatalogFormState } from "./actions";

const einheiten = ["Stück", "m²", "m", "Std."];

export default function KatalogForm({
  position,
  standardStundensatz,
  action,
}: {
  position?: CatalogItem;
  standardStundensatz: number;
  action: (
    state: KatalogFormState,
    formData: FormData,
  ) => Promise<KatalogFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [zeit, setZeit] = useState(String(position?.zeit_stunden ?? "0"));
  const [material, setMaterial] = useState(
    String(position?.material_preis ?? "0"),
  );
  const [satz, setSatz] = useState(
    String(position?.stundensatz ?? standardStundensatz),
  );

  const preis = useMemo(() => {
    const z = Number(zeit.replace(",", ".")) || 0;
    const m = Number(material.replace(",", ".")) || 0;
    const s = Number(satz.replace(",", ".")) || 0;
    return einzelpreis(z, s, m);
  }, [zeit, material, satz]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Feld label="Bezeichnung *">
        <input
          name="bezeichnung"
          required
          defaultValue={position?.bezeichnung}
          className={eingabeKlasse}
          placeholder="z.B. Dachlatte montieren"
        />
      </Feld>
      <Feld label="Einheit">
        <select
          name="einheit"
          defaultValue={position?.einheit ?? "Stück"}
          className={selectKlasse}
        >
          {einheiten.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </Feld>
      <Feld label="Zeitaufwand pro Einheit (Std.)">
        <input
          name="zeit_stunden"
          inputMode="decimal"
          value={zeit}
          onChange={(e) => setZeit(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Materialpreis pro Einheit (€)">
        <input
          name="material_preis"
          inputMode="decimal"
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Stundensatz (€) — überschreibt den Standard">
        <input
          name="stundensatz"
          inputMode="decimal"
          value={satz}
          onChange={(e) => setSatz(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>
      <div className="rounded-xl bg-zinc-100 p-4">
        <p className="text-sm text-zinc-500">Einzelpreis je Einheit</p>
        <p className="text-2xl font-bold text-zinc-900">{formatEuro(preis)}</p>
      </div>
      <Fehlertext>{state.fehler}</Fehlertext>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Speichert..." : "Speichern"}
      </PrimaryButton>
    </form>
  );
}
