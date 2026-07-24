import { Seite } from "@/components/ui";
import { holeFirmeneinstellungen } from "@/lib/settings";
import KatalogForm from "../katalog-form";
import { katalogEintragAnlegen } from "../actions";

export default async function NeuePositionPage() {
  const einstellungen = await holeFirmeneinstellungen();

  return (
    <Seite titel="Neue Position" zurueck="/katalog">
      <KatalogForm
        standardStundensatz={einstellungen.standard_stundensatz}
        action={katalogEintragAnlegen}
      />
    </Seite>
  );
}
