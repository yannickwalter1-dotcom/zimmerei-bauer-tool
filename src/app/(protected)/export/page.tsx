import { holeFirmeneinstellungen } from "@/lib/settings";
import { Seite } from "@/components/ui";
import ExportForm from "./export-form";

export default async function ExportPage() {
  const firma = await holeFirmeneinstellungen();

  return (
    <Seite titel="Steuerberater-Export" zurueck="/mehr">
      <p className="text-zinc-500">
        Alle Rechnungen eines Monats als PDF-Sammlung oder CSV-Liste
        herunterladen.
      </p>
      <ExportForm firma={firma} />
    </Seite>
  );
}
