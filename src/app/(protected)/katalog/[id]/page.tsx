import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { holeFirmeneinstellungen } from "@/lib/settings";
import { Seite } from "@/components/ui";
import KatalogForm from "../katalog-form";
import { katalogEintragAktualisieren } from "../actions";
import LoeschenButton from "./loeschen-button";

export default async function PositionBearbeitenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: position }, einstellungen] = await Promise.all([
    supabase.from("catalog_items").select("*").eq("id", id).maybeSingle(),
    holeFirmeneinstellungen(),
  ]);

  if (!position) {
    notFound();
  }

  const aktualisierenMitId = katalogEintragAktualisieren.bind(null, id);

  return (
    <Seite titel="Position bearbeiten" zurueck="/katalog">
      <KatalogForm
        position={position}
        standardStundensatz={einstellungen.standard_stundensatz}
        action={aktualisierenMitId}
      />
      <div className="mt-6">
        <LoeschenButton id={id} />
      </div>
    </Seite>
  );
}
