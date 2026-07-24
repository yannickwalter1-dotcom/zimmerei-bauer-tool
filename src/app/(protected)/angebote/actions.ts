"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { round2 } from "@/lib/calc";
import type { QuoteItemInput, QuoteStatus } from "@/types/database";

export interface AngebotEingabe {
  customer_id: string;
  titel: string;
  gueltig_bis: string | null;
  notiz_frei: string | null;
  mwst_satz: number;
  items: QuoteItemInput[];
}

export interface AngebotErgebnis {
  fehler?: string;
  id?: string;
}

function bereinigeItems(items: QuoteItemInput[]): QuoteItemInput[] {
  return items.map((item) => ({
    ...item,
    einzelpreis: round2(item.einzelpreis),
    gesamtpreis: round2(item.menge * item.einzelpreis),
  }));
}

function validiere(eingabe: AngebotEingabe): string | undefined {
  if (!eingabe.customer_id) return "Bitte einen Kunden auswählen.";
  if (!eingabe.titel.trim()) return "Bitte einen Titel eingeben.";
  if (!eingabe.items.length) return "Bitte mindestens eine Position hinzufügen.";
  for (const item of eingabe.items) {
    if (!item.bezeichnung.trim()) return "Jede Position braucht eine Bezeichnung.";
    if (!(item.menge > 0)) return "Menge muss größer als 0 sein.";
  }
  return undefined;
}

export async function angebotErstellen(
  eingabe: AngebotEingabe,
): Promise<AngebotErgebnis> {
  const fehler = validiere(eingabe);
  if (fehler) return { fehler };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_quote_with_items", {
    p_customer_id: eingabe.customer_id,
    p_titel: eingabe.titel.trim(),
    p_gueltig_bis: eingabe.gueltig_bis,
    p_notiz_frei: eingabe.notiz_frei,
    p_mwst_satz: eingabe.mwst_satz,
    p_items: bereinigeItems(eingabe.items),
  });

  if (error || !data) {
    return {
      fehler: "Angebot konnte nicht gespeichert werden: " + error?.message,
    };
  }

  revalidatePath("/angebote");
  return { id: data.id };
}

export async function angebotAktualisieren(
  quoteId: string,
  eingabe: AngebotEingabe,
): Promise<AngebotErgebnis> {
  const fehler = validiere(eingabe);
  if (fehler) return { fehler };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("update_quote_with_items", {
    p_quote_id: quoteId,
    p_customer_id: eingabe.customer_id,
    p_titel: eingabe.titel.trim(),
    p_gueltig_bis: eingabe.gueltig_bis,
    p_notiz_frei: eingabe.notiz_frei,
    p_mwst_satz: eingabe.mwst_satz,
    p_items: bereinigeItems(eingabe.items),
  });

  if (error || !data) {
    return {
      fehler: "Angebot konnte nicht gespeichert werden: " + error?.message,
    };
  }

  revalidatePath("/angebote");
  revalidatePath(`/angebote/${quoteId}`);
  return { id: data.id };
}

export async function angebotStatusAendern(
  quoteId: string,
  status: QuoteStatus,
): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", quoteId);

  if (error) {
    return { fehler: "Status konnte nicht geändert werden: " + error.message };
  }

  revalidatePath("/angebote");
  revalidatePath(`/angebote/${quoteId}`);
  return {};
}

export async function angebotLoeschen(quoteId: string): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", quoteId);

  if (error) {
    return {
      fehler:
        "Angebot kann nicht gelöscht werden. Vermutlich existiert bereits eine Rechnung dazu.",
    };
  }

  revalidatePath("/angebote");
  redirect("/angebote");
}
