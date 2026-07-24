"use server";

import { createClient } from "@/lib/supabase/server";
import type { RechnungMitDaten } from "@/lib/pdf/rechnungssammlung";

export async function holeRechnungenDesMonats(
  jahr: number,
  monat: number,
): Promise<RechnungMitDaten[]> {
  const supabase = await createClient();

  const start = `${jahr}-${String(monat).padStart(2, "0")}-01`;
  const endDatum = new Date(Date.UTC(jahr, monat, 1));
  const ende = endDatum.toISOString().slice(0, 10);

  const { data: rechnungen } = await supabase
    .from("invoices")
    .select("*")
    .gte("rechnungsdatum", start)
    .lt("rechnungsdatum", ende)
    .order("nummer", { ascending: true });

  if (!rechnungen?.length) return [];

  const kundenIds = [...new Set(rechnungen.map((r) => r.customer_id))];
  const rechnungIds = rechnungen.map((r) => r.id);

  const [{ data: kunden }, { data: positionen }] = await Promise.all([
    supabase.from("customers").select("*").in("id", kundenIds),
    supabase
      .from("invoice_items")
      .select("*")
      .in("invoice_id", rechnungIds)
      .order("sortierung", { ascending: true }),
  ]);

  const kundenNachId = new Map((kunden ?? []).map((k) => [k.id, k]));

  return rechnungen.map((rechnung) => ({
    rechnung,
    kunde: kundenNachId.get(rechnung.customer_id)!,
    positionen: (positionen ?? []).filter((p) => p.invoice_id === rechnung.id),
  }));
}
