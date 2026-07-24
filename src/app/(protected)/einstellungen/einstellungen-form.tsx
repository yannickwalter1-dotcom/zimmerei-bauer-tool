"use client";

import { useActionState, useState } from "react";
import type { CompanySettings } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  eingabeKlasse,
  Fehlertext,
  Feld,
  PrimaryButton,
} from "@/components/ui";
import { einstellungenAktualisieren, type EinstellungenFormState } from "./actions";

const initialState: EinstellungenFormState = {};

export default function EinstellungenForm({
  einstellungen,
}: {
  einstellungen: CompanySettings;
}) {
  const [state, formAction, pending] = useActionState(
    einstellungenAktualisieren,
    initialState,
  );
  const [logoUrl, setLogoUrl] = useState(einstellungen.logo_url ?? "");
  const [logoLaedt, setLogoLaedt] = useState(false);

  async function logoHochladen(datei: File) {
    setLogoLaedt(true);
    const supabase = createClient();
    const pfad = `logo/${Date.now()}-${datei.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage
      .from("baustellenfotos")
      .upload(pfad, datei, { upsert: true });
    setLogoLaedt(false);
    if (!error) {
      setLogoUrl(
        supabase.storage.from("baustellenfotos").getPublicUrl(pfad).data.publicUrl,
      );
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="logo_url" value={logoUrl} />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-600">Firmenlogo</span>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Firmenlogo" className="h-20 w-auto object-contain" />
        )}
        <label className="flex h-12 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white font-medium text-zinc-900 active:bg-zinc-100">
          {logoLaedt ? "Lädt hoch..." : "Logo auswählen"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const datei = e.target.files?.[0];
              if (datei) logoHochladen(datei);
            }}
          />
        </label>
      </div>

      <Feld label="Firmenname *">
        <input
          name="firmenname"
          required
          defaultValue={einstellungen.firmenname}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Straße & Hausnummer *">
        <input
          name="strasse"
          required
          defaultValue={einstellungen.strasse}
          className={eingabeKlasse}
        />
      </Feld>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <Feld label="PLZ *">
            <input
              name="plz"
              required
              defaultValue={einstellungen.plz}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
        <div className="col-span-2">
          <Feld label="Ort *">
            <input
              name="ort"
              required
              defaultValue={einstellungen.ort}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
      </div>
      <Feld label="Telefon">
        <input
          name="telefon"
          defaultValue={einstellungen.telefon ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="E-Mail">
        <input
          name="email"
          type="email"
          defaultValue={einstellungen.email ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Steuernummer">
        <input
          name="steuernummer"
          defaultValue={einstellungen.steuernummer ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="USt-IdNr.">
        <input
          name="ust_id"
          defaultValue={einstellungen.ust_id ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Bank Name">
        <input
          name="bank_name"
          defaultValue={einstellungen.bank_name ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="IBAN">
        <input
          name="bank_iban"
          defaultValue={einstellungen.bank_iban ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="BIC">
        <input
          name="bank_bic"
          defaultValue={einstellungen.bank_bic ?? ""}
          className={eingabeKlasse}
        />
      </Feld>

      <div className="my-1 h-px bg-zinc-200" />

      <Feld label="Standard-Stundensatz (€)">
        <input
          name="standard_stundensatz"
          inputMode="decimal"
          defaultValue={einstellungen.standard_stundensatz}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Standard-Zahlungsziel (Tage)">
        <input
          name="standard_zahlungsziel_tage"
          inputMode="numeric"
          defaultValue={einstellungen.standard_zahlungsziel_tage}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Standard-Gültigkeit Angebot (Tage)">
        <input
          name="standard_gueltigkeit_tage"
          inputMode="numeric"
          defaultValue={einstellungen.standard_gueltigkeit_tage}
          className={eingabeKlasse}
        />
      </Feld>

      <Fehlertext>{state.fehler}</Fehlertext>
      {state.erfolg && (
        <p className="text-sm font-medium text-green-700">Gespeichert.</p>
      )}
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Speichert..." : "Speichern"}
      </PrimaryButton>
    </form>
  );
}
