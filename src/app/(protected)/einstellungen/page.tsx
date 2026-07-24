import { holeFirmeneinstellungen } from "@/lib/settings";
import { Seite } from "@/components/ui";
import EinstellungenForm from "./einstellungen-form";

export default async function EinstellungenPage() {
  const einstellungen = await holeFirmeneinstellungen();

  return (
    <Seite titel="Firmendaten & Einstellungen" zurueck="/mehr">
      <EinstellungenForm einstellungen={einstellungen} />
    </Seite>
  );
}
