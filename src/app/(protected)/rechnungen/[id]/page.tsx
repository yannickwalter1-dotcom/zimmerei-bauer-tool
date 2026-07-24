import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { holeFirmeneinstellungen } from "@/lib/settings";
import { datumPlusTage, formatDatum, formatEuro } from "@/lib/format";
import { summen } from "@/lib/calc";
import { Badge, Karte, Seite } from "@/components/ui";
import PdfButton from "./pdf-button";
import StatusSchalter from "./status-schalter";
import StornoButton from "./storno-button";

const statusLabel = {
  offen: "Offen",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
} as const;

export default async function RechnungDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: rechnung }, { data: positionen }, firma] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sortierung", { ascending: true }),
    holeFirmeneinstellungen(),
  ]);

  if (!rechnung) notFound();

  const [{ data: kunde }, { data: stornierteRechnung }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", rechnung.customer_id).maybeSingle(),
    supabase
      .from("invoices")
      .select("id, nummer")
      .eq("storniert_von", id)
      .maybeSingle(),
  ]);

  if (!kunde) notFound();

  const { data: freigegebeneDokus } = rechnung.quote_id
    ? await supabase
        .from("site_docs")
        .select("*")
        .eq("quote_id", rechnung.quote_id)
        .eq("fuer_kunde_freigegeben", true)
        .order("created_at", { ascending: true })
    : { data: [] };

  const { netto, mwst, brutto } = summen(rechnung.summe_netto, rechnung.mwst_satz);

  return (
    <Seite titel={rechnung.nummer} zurueck="/rechnungen">
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">{kunde.name}</h2>
            <p className="text-zinc-500">
              Rechnungsdatum {formatDatum(rechnung.rechnungsdatum)}
            </p>
          </div>
          <Badge farbe={rechnung.status === "bezahlt" ? "green" : rechnung.status === "storniert" ? "zinc" : "amber"}>
            {statusLabel[rechnung.status]}
          </Badge>
        </div>

        {rechnung.quote_id && (
          <Link href={`/angebote/${rechnung.quote_id}`} className="text-sm text-zinc-500 underline">
            Zum ursprünglichen Angebot
          </Link>
        )}

        {rechnung.storniert_von && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Diese Rechnung wurde storniert. Siehe Stornorechnung.
          </p>
        )}
        {stornierteRechnung && (
          <p className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700">
            Diese Rechnung storniert{" "}
            <Link
              href={`/rechnungen/${stornierteRechnung.id}`}
              className="underline"
            >
              Rechnung {stornierteRechnung.nummer}
            </Link>
            .
          </p>
        )}

        <StatusSchalter invoiceId={rechnung.id} status={rechnung.status} />

        <div className="flex flex-col gap-2">
          {positionen?.map((p) => (
            <Karte key={p.id}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-zinc-900">{p.bezeichnung}</p>
                  <p className="text-sm text-zinc-500">
                    {p.menge} {p.einheit} × {formatEuro(p.einzelpreis)}
                  </p>
                </div>
                <p className="font-bold text-zinc-900">{formatEuro(p.gesamtpreis)}</p>
              </div>
            </Karte>
          ))}
        </div>

        <div className="rounded-xl bg-zinc-100 p-4">
          <div className="flex justify-between text-sm text-zinc-500">
            <span>Netto</span>
            <span>{formatEuro(netto)}</span>
          </div>
          <div className="flex justify-between text-sm text-zinc-500">
            <span>MwSt. ({rechnung.mwst_satz}%)</span>
            <span>{formatEuro(mwst)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-zinc-300 pt-1 text-lg font-bold text-zinc-900">
            <span>Brutto</span>
            <span>{formatEuro(brutto)}</span>
          </div>
        </div>

        <p className="text-sm text-zinc-500">
          Leistungsdatum {formatDatum(rechnung.leistungsdatum)} · Zahlbar bis{" "}
          {formatDatum(
            datumPlusTage(rechnung.rechnungsdatum, rechnung.zahlungsziel_tage),
          )}
        </p>

        <PdfButton
          firma={firma}
          kunde={kunde}
          rechnung={rechnung}
          positionen={positionen ?? []}
          freigegebeneDokus={freigegebeneDokus ?? []}
        />

        <p className="text-center text-xs text-zinc-400">
          Rechnungen können aus rechtlichen Gründen (GoBD) nicht nachträglich
          geändert werden. Korrekturen nur über eine Stornorechnung.
        </p>

        {rechnung.status !== "storniert" && <StornoButton invoiceId={rechnung.id} />}
      </div>
    </Seite>
  );
}
