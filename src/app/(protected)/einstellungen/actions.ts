"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface EinstellungenFormState {
  fehler?: string;
  erfolg?: boolean;
}

function zahl(formData: FormData, feld: string, standard: number): number {
  const wert = String(formData.get(feld) ?? "").replace(",", ".").trim();
  const n = Number(wert);
  return Number.isFinite(n) && wert !== "" ? n : standard;
}

function text(formData: FormData, feld: string): string | null {
  const wert = String(formData.get(feld) ?? "").trim();
  return wert || null;
}

export async function einstellungenAktualisieren(
  _vorheriger: EinstellungenFormState,
  formData: FormData,
): Promise<EinstellungenFormState> {
  const firmenname = String(formData.get("firmenname") ?? "").trim();
  const strasse = String(formData.get("strasse") ?? "").trim();
  const plz = String(formData.get("plz") ?? "").trim();
  const ort = String(formData.get("ort") ?? "").trim();

  if (!firmenname || !strasse || !plz || !ort) {
    return { fehler: "Bitte Firmenname und vollständige Anschrift angeben." };
  }

  const daten = {
    firmenname,
    strasse,
    plz,
    ort,
    telefon: text(formData, "telefon"),
    email: text(formData, "email"),
    steuernummer: text(formData, "steuernummer"),
    ust_id: text(formData, "ust_id"),
    bank_iban: text(formData, "bank_iban"),
    bank_bic: text(formData, "bank_bic"),
    bank_name: text(formData, "bank_name"),
    logo_url: text(formData, "logo_url"),
    standard_stundensatz: zahl(formData, "standard_stundensatz", 45),
    standard_zahlungsziel_tage: Math.round(
      zahl(formData, "standard_zahlungsziel_tage", 14),
    ),
    standard_gueltigkeit_tage: Math.round(
      zahl(formData, "standard_gueltigkeit_tage", 14),
    ),
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("company_settings")
    .upsert({ id: true, ...daten }, { onConflict: "id" });

  if (error) {
    return { fehler: "Einstellungen konnten nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/einstellungen");
  return { erfolg: true };
}
