import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { einzelpreis } from "@/lib/calc";
import { formatEuro, formatZahl } from "@/lib/format";
import { Karte, LeerZustand, Seite } from "@/components/ui";

export default async function KatalogPage() {
  const supabase = await createClient();
  const { data: positionen } = await supabase
    .from("catalog_items")
    .select("*")
    .order("sortierung", { ascending: true });

  return (
    <Seite
      titel="Positionskatalog"
      aktion={
        <Link
          href="/katalog/neu"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-2xl text-white"
          aria-label="Neue Position"
        >
          +
        </Link>
      }
    >
      <div className="flex flex-col gap-2">
        {!positionen?.length && (
          <LeerZustand text="Noch keine Standardleistungen angelegt." />
        )}
        {positionen?.map((p) => (
          <Karte key={p.id} href={`/katalog/${p.id}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-zinc-900">
                  {p.bezeichnung}
                </p>
                <p className="text-sm text-zinc-500">
                  {formatZahl(p.zeit_stunden)} Std. je {p.einheit} ·{" "}
                  {formatEuro(p.stundensatz)}/Std. + {formatEuro(p.material_preis)}{" "}
                  Material
                </p>
              </div>
              <p className="whitespace-nowrap text-lg font-bold text-zinc-900">
                {formatEuro(
                  einzelpreis(p.zeit_stunden, p.stundensatz, p.material_preis),
                )}
              </p>
            </div>
          </Karte>
        ))}
      </div>
    </Seite>
  );
}
