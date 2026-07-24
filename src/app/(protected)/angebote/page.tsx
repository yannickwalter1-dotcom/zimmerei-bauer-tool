import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDatum, formatEuro } from "@/lib/format";
import { summen } from "@/lib/calc";
import { Badge, Karte, LeerZustand, Seite } from "@/components/ui";
import type { QuoteStatus } from "@/types/database";

const statusFarbe: Record<QuoteStatus, "zinc" | "blue" | "green" | "red"> = {
  entwurf: "zinc",
  versendet: "blue",
  angenommen: "green",
  abgelehnt: "red",
};

const statusLabel: Record<QuoteStatus, string> = {
  entwurf: "Entwurf",
  versendet: "Versendet",
  angenommen: "Angenommen",
  abgelehnt: "Abgelehnt",
};

export default async function AngeboteListePage() {
  const supabase = await createClient();
  const [{ data: angebote }, { data: kunden }] = await Promise.all([
    supabase.from("quotes").select("*").order("created_at", { ascending: false }),
    supabase.from("customers").select("id, name"),
  ]);

  const kundenNamen = new Map((kunden ?? []).map((k) => [k.id, k.name]));

  return (
    <Seite
      titel="Angebote"
      aktion={
        <Link
          href="/angebote/neu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-2xl text-white"
          aria-label="Neues Angebot"
        >
          +
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        {!angebote?.length && <LeerZustand text="Noch keine Angebote erstellt." />}
        {angebote?.map((a) => {
          const { brutto } = summen(a.summe_netto, a.mwst_satz);
          return (
            <Karte key={a.id} href={`/angebote/${a.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-zinc-500">{a.nummer}</p>
                  <p className="text-lg font-semibold text-zinc-900">{a.titel}</p>
                  <p className="text-sm text-zinc-500">
                    {kundenNamen.get(a.customer_id) ?? ""} · {formatDatum(a.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge farbe={statusFarbe[a.status]}>{statusLabel[a.status]}</Badge>
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
