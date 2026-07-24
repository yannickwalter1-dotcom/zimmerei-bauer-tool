import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { holeFirmeneinstellungen } from "@/lib/settings";
import { heuteISO } from "@/lib/format";
import { Seite } from "@/components/ui";
import RechnungErstellenForm from "./rechnung-erstellen-form";

export default async function RechnungErstellenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: angebot }, { data: bestehendeRechnung }, einstellungen] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("invoices")
        .select("id")
        .eq("quote_id", id)
        .maybeSingle(),
      holeFirmeneinstellungen(),
    ]);

  if (!angebot) notFound();
  if (bestehendeRechnung) {
    redirect(`/rechnungen/${bestehendeRechnung.id}`);
  }

  return (
    <Seite titel="Rechnung erstellen" zurueck={`/angebote/${id}`}>
      <p className="text-zinc-500">
        Die Positionen aus &quot;{angebot.titel}&quot; werden 1:1 in die Rechnung
        übernommen.
      </p>
      <RechnungErstellenForm
        quoteId={id}
        leistungsdatum={heuteISO()}
        zahlungszielTage={einstellungen.standard_zahlungsziel_tage}
      />
    </Seite>
  );
}
