import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Karte, LeerZustand, Seite } from "@/components/ui";

export default async function KundenListePage() {
  const supabase = await createClient();
  const { data: kunden } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  return (
    <Seite
      titel="Kunden"
      aktion={
        <Link
          href="/kunden/neu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-2xl text-white"
          aria-label="Neuer Kunde"
        >
          +
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        {!kunden?.length && <LeerZustand text="Noch keine Kunden angelegt." />}
        {kunden?.map((kunde) => (
          <Karte key={kunde.id} href={`/kunden/${kunde.id}`}>
            <p className="text-lg font-semibold text-zinc-900">{kunde.name}</p>
            {(kunde.strasse || kunde.ort) && (
              <p className="text-sm text-zinc-500">
                {[kunde.strasse, [kunde.plz, kunde.ort].filter(Boolean).join(" ")]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {kunde.telefon && (
              <p className="text-sm text-zinc-500">{kunde.telefon}</p>
            )}
          </Karte>
        ))}
      </div>
    </Seite>
  );
}
