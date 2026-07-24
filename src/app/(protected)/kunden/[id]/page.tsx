import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Seite } from "@/components/ui";
import KundenForm from "../kunden-form";
import { kundeAktualisieren } from "../actions";
import LoeschenButton from "./loeschen-button";

export default async function KundeBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: kunde } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!kunde) {
    notFound();
  }

  const aktualisierenMitId = kundeAktualisieren.bind(null, id);

  return (
    <Seite titel="Kunde bearbeiten" zurueck="/kunden">
      <KundenForm kunde={kunde} action={aktualisierenMitId} />
      <div className="mt-6">
        <LoeschenButton id={id} />
      </div>
    </Seite>
  );
}
