import { createClient } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/database";

// Fallback, falls die Firmeneinstellungen (noch) nicht geladen werden können,
// z.B. bevor supabase/schema.sql eingespielt wurde. Verhindert einen Absturz
// der Seite und entspricht den Standardwerten aus dem Schema.
const STANDARD_EINSTELLUNGEN: CompanySettings = {
  id: true,
  firmenname: "Zimmerei Mustermann",
  strasse: "Musterstraße 1",
  plz: "12345",
  ort: "Musterstadt",
  telefon: null,
  email: null,
  steuernummer: null,
  ust_id: null,
  bank_iban: null,
  bank_bic: null,
  bank_name: null,
  logo_url: null,
  standard_stundensatz: 45,
  standard_zahlungsziel_tage: 14,
  standard_gueltigkeit_tage: 14,
};

// company_settings enthält immer genau eine Zeile (id = true).
export async function holeFirmeneinstellungen(): Promise<CompanySettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();

  return data ?? STANDARD_EINSTELLUNGEN;
}
