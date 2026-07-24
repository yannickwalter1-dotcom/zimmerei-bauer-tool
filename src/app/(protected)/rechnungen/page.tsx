import { createClient } from "@/lib/supabase/server";
import { formatDatum, formatEuro } from "@/lib/format";
import { summen } from "@/lib/calc";
import { Badge, Karte, LeerZustand, Seite } from "@/components/ui";
import type { InvoiceStatus } from "@/types/database";

const statusFarbe: Record<InvoiceStatus, "amber" | "green" | "zinc"> = {
  offen: "amber",
  bezahlt: "green",
  storniert: "zinc",
};

const statusLabel: Record<InvoiceStatus, string> = {
  offen: "Offen",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
};

export default async function RechnungenListePage() {
  const supabase = await createClient();
  const [{ data: rechnungen }, { data: kunden }] = await Promise.all([
    supabase.from("invoices").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id, name"),
  ]);

  const kundenNamen = new Map((kunden ?? []).map((k) => [k.id, k.name]));

  return (
    <Seite titel="Rechnungen">
      <div className="flex flex-col gap-2">
        {!rechnungen?.length && (
          <LeerZustand text="Noch keine Rechnungen erstellt." />
        )}
        {rechnungen?.map((r) => {
          const { brutto } = summen(r.summe_netto, r.mwst_satz);
          return (
            <Karte key={r.id} href={`/rechnungen/${r.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">{r.nummer}</p>
                  <p className="text-lg font-semibold text-zinc-900">
                    {kundenNamen.get(r.customer_id) ?? ""}
                  </p>
                  <p className="text-sm text-zinc-500">
                    {formatDatum(r.rechnungsdatum)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge farbe={statusFarbe[r.status]}>{statusLabel[r.status]}</Badge>
                  <p className="font-bold text-zinc-900">{formatEuro(brutto)}</p>
                </div>
              </div>
            </Karte>
          );
        })}
      </div>
    </Seite>
  );
}
