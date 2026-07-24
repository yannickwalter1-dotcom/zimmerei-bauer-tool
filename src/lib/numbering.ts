import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Ruft die atomare Postgres-Funktion next_beleg_nummer(...) auf, damit
// Angebots-/Rechnungsnummern auch bei gleichzeitigem Zugriff lückenlos und
// fortlaufend bleiben (siehe supabase/schema.sql).
export async function naechsteNummer(
  supabase: SupabaseClient<Database>,
  key: "angebot" | "rechnung",
  jahr: number = new Date().getFullYear(),
): Promise<string> {
  const { data, error } = await supabase.rpc("next_beleg_nummer", {
    p_key: key,
    p_jahr: jahr,
  });

  if (error) {
    throw new Error(`Nummer konnte nicht vergeben werden: ${error.message}`);
  }

  return data as string;
}
