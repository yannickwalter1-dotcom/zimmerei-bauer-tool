"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function dokuEintragErstellen(
  quoteId: string,
  notiz: string | null,
  fotoUrl: string | null,
  fuerKundeFreigegeben: boolean,
): Promise<{ fehler?: string }> {
  if (!notiz && !fotoUrl) {
    return { fehler: "Bitte ein Foto oder eine Notiz erfassen." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_docs").insert({
    quote_id: quoteId,
    notiz,
    foto_url: fotoUrl,
    fuer_kunde_freigegeben: fuerKundeFreigegeben,
  });

  if (error) {
    return { fehler: "Eintrag konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath(`/angebote/${quoteId}/dokumentation`);
  return {};
}

export async function dokuFreigabeUmschalten(
  quoteId: string,
  docId: string,
  freigegeben: boolean,
): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("site_docs")
    .update({ fuer_kunde_freigegeben: freigegeben })
    .eq("id", docId);

  if (error) {
    return { fehler: "Freigabe konnte nicht geändert werden: " + error.message };
  }

  revalidatePath(`/angebote/${quoteId}/dokumentation`);
  return {};
}

export async function dokuLoeschen(
  quoteId: string,
  docId: string,
): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("site_docs").delete().eq("id", docId);

  if (error) {
    return { fehler: "Eintrag konnte nicht gelöscht werden: " + error.message };
  }

  revalidatePath(`/angebote/${quoteId}/dokumentation`);
  return {};
}
