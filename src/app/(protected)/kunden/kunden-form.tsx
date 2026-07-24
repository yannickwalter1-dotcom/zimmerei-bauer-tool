"use client";

import { useActionState } from "react";
import type { Customer } from "@/types/database";
import {
  eingabeKlasse,
  Fehlertext,
  Feld,
  PrimaryButton,
  textareaKlasse,
} from "@/components/ui";
import type { KundenFormState } from "./actions";

export default function KundenForm({
  kunde,
  action,
}: {
  kunde?: Customer;
  action: (
    state: KundenFormState,
    formData: FormData,
  ) => Promise<KundenFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Feld label="Name *">
        <input
          name="name"
          required
          defaultValue={kunde?.name}
          className={eingabeKlasse}
          placeholder="z.B. Max Mustermann"
        />
      </Feld>
      <Feld label="Straße & Hausnummer">
        <input
          name="strasse"
          defaultValue={kunde?.strasse ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <Feld label="PLZ">
            <input
              name="plz"
              defaultValue={kunde?.plz ?? ""}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
        <div className="col-span-2">
          <Feld label="Ort">
            <input
              name="ort"
              defaultValue={kunde?.ort ?? ""}
              className={eingabeKlasse}
            />
          </Feld>
        </div>
      </div>
      <Feld label="Telefon">
        <input
          name="telefon"
          type="tel"
          defaultValue={kunde?.telefon ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="E-Mail">
        <input
          name="email"
          type="email"
          defaultValue={kunde?.email ?? ""}
          className={eingabeKlasse}
        />
      </Feld>
      <Feld label="Notiz">
        <textarea
          name="notiz"
          rows={3}
          defaultValue={kunde?.notiz ?? ""}
          className={textareaKlasse}
        />
      </Feld>
      <Fehlertext>{state.fehler}</Fehlertext>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Speichert..." : "Speichern"}
      </PrimaryButton>
    </form>
  );
}
