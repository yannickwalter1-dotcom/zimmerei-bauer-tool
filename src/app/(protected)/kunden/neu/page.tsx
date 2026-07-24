import { Seite } from "@/components/ui";
import KundenForm from "../kunden-form";
import { kundeAnlegen } from "../actions";

export default function NeuerKundePage() {
  return (
    <Seite titel="Neuer Kunde" zurueck="/kunden">
      <KundenForm action={kundeAnlegen} />
    </Seite>
  );
}
