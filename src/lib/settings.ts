import { createClient } from "@/lib/supabase/server";
import type { CompanySettings } from "@/types/database";

// company_settings enthält immer genau eine Zeile (id = true).
export async function holeFirmeneinstellungen(): Promise<CompanySettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", true)
    .single();

  return data as CompanySettings;
}
