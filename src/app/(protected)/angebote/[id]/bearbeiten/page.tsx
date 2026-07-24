import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Seite } from "@/components/ui";
import AngebotForm from "../../angebot-form";
import { angebotAktualisieren } from "../../actions";

export default async function AngebotBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: angebot }, { data: positionen }, { data: kunden }, { data: katalog }] =
    await Promise.all([
      supabase.from("quotes").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("quote_items")
        .select("*")
        .eq("quote_id", id)
        .order("sortierung", { ascending: true }),
      supabase.from("customers").select("*").order("name", { ascending: true }),
      supabase
        .from("catalog_items")
        .select("*")
        .order("sortierung", { ascending: true }),
    ]);

  if (!angebot) notFound();
  if (angebot.status !== "entwurf") {
    redirect(`/angebote/${id}`);
  }

  const aktualisierenMitId = angebotAktualisieren.bind(null, id);

  return (
    <Seite titel="Angebot bearbeiten" zurueck={`/angebote/${id}`}>
      <AngebotForm
        kunden={kunden ?? []}
        katalog={katalog ?? []}
        vorbelegung={{
          customer_id: angebot.customer_id,
          titel: angebot.titel,
          gueltig_bis: angebot.gueltig_bis ?? "",
          notiz_frei: angebot.notiz_frei ?? "",
          mwst_satz: angebot.mwst_satz,
          items: (positionen ?? []).map((p) => ({
            key: p.id,
            catalog_item_id: p.catalog_item_id,
            bezeichnung: p.bezeichnung,
            einheit: p.einheit,
            menge: p.menge,
            zeit_stunden: p.zeit_stunden,
            material_preis: p.material_preis,
            stundensatz: p.stundensatz,
            einzelpreis: p.einzelpreis,
            gesamtpreis: p.gesamtpreis,
          })),
        }}
        submitLabel="Änderungen speichern"
        onSubmit={aktualisierenMitId}
      />
    </Seite>
  );
}
