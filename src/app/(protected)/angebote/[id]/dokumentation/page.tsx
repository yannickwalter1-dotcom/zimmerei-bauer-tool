import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Seite, LeerZustand } from "@/components/ui";
import UploadForm from "./upload-form";
import EintragKarte from "./eintrag-karte";

export default async function BaustellendokuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: angebot }, { data: eintraege }] = await Promise.all([
    supabase.from("quotes").select("id, titel").eq("id", id).maybeSingle(),
    supabase
      .from("site_docs")
      .select("*")
      .eq("quote_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!angebot) notFound();

  return (
    <Seite titel="Baustellendoku" zurueck={`/angebote/${id}`}>
      <p className="text-zinc-500">{angebot.titel}</p>
      <div className="flex flex-col gap-4">
        <UploadForm quoteId={id} />
        {!eintraege?.length && (
          <LeerZustand text="Noch keine Fotos oder Notizen erfasst." />
        )}
        {eintraege?.map((e) => (
          <EintragKarte key={e.id} quoteId={id} eintrag={e} />
        ))}
      </div>
    </Seite>
  );
}
