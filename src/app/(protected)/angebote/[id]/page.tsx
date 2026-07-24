import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { holeFirmeneinstellungen } from "@/lib/settings";
import { formatDatum, formatEuro } from "@/lib/format";
import { summen } from "@/lib/calc";
import { Karte, Seite } from "@/components/ui";
import PdfButton from "./pdf-button";
import StatusAuswahl from "./status-auswahl";
import LoeschenButton from "./loeschen-button";

export default async function AngebotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: angebot }, { data: positionen }, firma, { data: rechnung }] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id)
        .order("sortierung", { ascending: true }),
      holeFirmeneinstellungen(),
      supabase.from("invoices").select("id, nummer").eq("quote_id", id).maybeSingle(),
    ]);

  if (!angebot) notFound();

  const { data: kunde } = await supabase
    .from("customers")
    .select("*")
    .eq("id", angebot.customer_id)
    .maybeSingle();

  if (!kunde) notFound();

  const { netto, mwst, brutto } = summen(angebot.summe_netto, angebot.mwst_satz);

  return (
    <Seite titel={angebot.nummer} zurueck="/angebote">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">{angebot.titel}</h2>
          <p className="text-zinc-500">{kunde.name}</p>
        </div>

        <StatusAuswahl quoteId={angebot.id} status={angebot.status} />

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
            <span>MwSt. ({angebot.mwst_satz}%)</span>
            <span>{formatEuro(mwst)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-zinc-300 pt-1 text-lg font-bold text-zinc-900">
            <span>Brutto</span>
            <span>{formatEuro(brutto)}</span>
          </div>
        </div>

        {angebot.gueltig_bis && (
          <p className="text-sm text-zinc-500">
            Gültig bis {formatDatum(angebot.gueltig_bis)}
          </p>
        )}

        {angebot.notiz_frei && (
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="mb-1 text-sm font-medium text-zinc-500">Notiz</p>
            <p className="whitespace-pre-wrap text-zinc-900">{angebot.notiz_frei}</p>
          </div>
        )}

        <PdfButton firma={firma} kunde={kunde} angebot={angebot} positionen={positionen ?? []} />

        {rechnung ? (
          <Link
            href={`/rechnungen/${rechnung.id}`}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-zinc-900 text-lg font-semibold text-white active:bg-zinc-700"
          >
            🧾 Rechnung {rechnung.nummer} ansehen
          </Link>
        ) : (
          <Link
            href={`/angebote/${angebot.id}/rechnung-erstellen`}
            className="flex h-14 w-full items-center justify-center rounded-xl bg-zinc-900 text-lg font-semibold text-white active:bg-zinc-700"
          >
            Rechnung erstellen
          </Link>
        )}

        {angebot.status === "entwurf" && (
          <Link
            href={`/angebote/${angebot.id}/bearbeiten`}
            className="flex h-14 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-lg font-semibold text-zinc-900 active:bg-zinc-100"
          >
            Angebot bearbeiten
          </Link>
        )}

        <Link
          href={`/angebote/${angebot.id}/dokumentation`}
          className="flex h-14 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-lg font-semibold text-zinc-900 active:bg-zinc-100"
        >
          📷 Baustellendoku
        </Link>

        {angebot.status === "entwurf" && <LoeschenButton id={angebot.id} />}
      </div>
    </Seite>
  );
}
