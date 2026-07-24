"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface RechnungErgebnis {
  fehler?: string;
  id?: string;
}

export async function rechnungAusAngebotErstellen(
  quoteId: string,
  leistungsdatum: string,
  zahlungszielTage: number,
): Promise<RechnungErgebnis> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_invoice_from_quote", {
    p_quote_id: quoteId,
    p_rechnungsdatum: new Date().toISOString().slice(0, 10),
    p_leistungsdatum: leistungsdatum,
    p_zahlungsziel_tage: zahlungszielTage,
  });

  if (error || !data) {
    return {
      fehler: "Rechnung konnte nicht erstellt werden: " + error?.message,
    };
  }

  revalidatePath("/rechnungen");
  revalidatePath(`/angebote/${quoteId}`);
  return { id: data.id };
}

export async function rechnungStatusAendern(
  invoiceId: string,
  status: "offen" | "bezahlt",
): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .neq("status", "storniert");

  if (error) {
    return { fehler: "Status konnte nicht geändert werden: " + error.message };
  }

  revalidatePath("/rechnungen");
  revalidatePath(`/rechnungen/${invoiceId}`);
  return {};
}

export async function rechnungStornieren(
  invoiceId: string,
): Promise<RechnungErgebnis> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("storniere_rechnung", {
    p_invoice_id: invoiceId,
  });

  if (error || !data) {
    return {
      fehler: "Stornorechnung konnte nicht erstellt werden: " + error?.message,
    };
  }

  revalidatePath("/rechnungen");
  revalidatePath(`/rechnungen/${invoiceId}`);
  redirect(`/rechnungen/${data.id}`);
}
