import { createClient } from "@/lib/supabase/server";
import { holeFirmeneinstellungen } from "@/lib/settings";
import { datumPlusTage, heuteISO } from "@/lib/format";
import { Seite } from "@/components/ui";
import AngebotForm from "../angebot-form";
import { angebotErstellen } from "../actions";

export default async function NeuesAngebotPage() {
  const supabase = await createClient();
  const [{ data: kunden }, { data: katalog }, einstellungen] = await Promise.all([
    supabase.from("customers").select("*").order("name", { ascending: true }),
    supabase
      .from("catalog_items")
      .select("*")
      .order("sortierung", { ascending: true }),
    holeFirmeneinstellungen(),
  ]);

  return (
    <Seite titel="Neues Angebot" zurueck="/angebote">
      <AngebotForm
        kunden={kunden ?? []}
        katalog={katalog ?? []}
        vorbelegung={{
          customer_id: "",
          titel: "",
          gueltig_bis: datumPlusTage(
            heuteISO(),
            einstellungen.standard_gueltigkeit_tage,
          ),
          notiz_frei: "",
          mwst_satz: 19,
          items: [],
        }}
        submitLabel="Angebot speichern"
        onSubmit={angebotErstellen}
      />
    </Seite>
  );
}
