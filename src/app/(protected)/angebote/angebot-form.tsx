"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CatalogItem, Customer, QuoteItemInput } from "@/types/database";
import { einzelpreis, round2, summen } from "@/lib/calc";
import { formatEuro } from "@/lib/format";
import {
  eingabeKlasse,
  Fehlertext,
  Feld,
  PrimaryButton,
  selectKlasse,
  textareaKlasse,
} from "@/components/ui";
import Spracheingabe from "@/components/spracheingabe";
import type { AngebotEingabe, AngebotErgebnis } from "./actions";

type Zeile = QuoteItemInput & { key: string };

function neueZeileAusKatalog(item: CatalogItem): Zeile {
  return {
    key: crypto.randomUUID(),
    catalog_item_id: item.id,
    bezeichnung: item.bezeichnung,
    einheit: item.einheit,
    menge: 1,
    zeit_stunden: item.zeit_stunden,
    material_preis: item.material_preis,
    stundensatz: item.stundensatz,
    einzelpreis: einzelpreis(item.zeit_stunden, item.stundensatz, item.material_preis),
    gesamtpreis: einzelpreis(item.zeit_stunden, item.stundensatz, item.material_preis),
  };
}

function neueFreieZeile(): Zeile {
  return {
    key: crypto.randomUUID(),
    catalog_item_id: null,
    bezeichnung: "",
    einheit: "Stück",
    menge: 1,
    zeit_stunden: 0,
    material_preis: 0,
    stundensatz: 0,
    einzelpreis: 0,
    gesamtpreis: 0,
  };
}

export interface AngebotFormWert {
  customer_id: string;
  titel: string;
  gueltig_bis: string;
  notiz_frei: string;
  mwst_satz: number;
  items: Zeile[];
}

export default function AngebotForm({
  kunden,
  katalog,
  vorbelegung,
  submitLabel,
  onSubmit,
}: {
  kunden: Customer[];
  katalog: CatalogItem[];
  vorbelegung: AngebotFormWert;
  submitLabel: string;
  onSubmit: (eingabe: AngebotEingabe) => Promise<AngebotErgebnis>;
}) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState(vorbelegung.customer_id);
  const [titel, setTitel] = useState(vorbelegung.titel);
  const [gueltigBis, setGueltigBis] = useState(vorbelegung.gueltig_bis);
  const [notizFrei, setNotizFrei] = useState(vorbelegung.notiz_frei);
  const [mwstSatz] = useState(vorbelegung.mwst_satz);
  const [items, setItems] = useState<Zeile[]>(vorbelegung.items);
  const [zeigeKatalog, setZeigeKatalog] = useState(false);
  const [fehler, setFehler] = useState<string>();
  const [speichert, setSpeichert] = useState(false);

  const summenWert = useMemo(() => {
    const netto = items.reduce((sum, i) => sum + i.gesamtpreis, 0);
    return summen(netto, mwstSatz);
  }, [items, mwstSatz]);

  function katalogPositionHinzufuegen(item: CatalogItem) {
    setItems((alt) => [...alt, neueZeileAusKatalog(item)]);
    setZeigeKatalog(false);
  }

  function freiePositionHinzufuegen() {
    setItems((alt) => [...alt, neueFreieZeile()]);
  }

  function zeileEntfernen(key: string) {
    setItems((alt) => alt.filter((i) => i.key !== key));
  }

  function zeileAendern(key: string, aenderung: Partial<Zeile>) {
    setItems((alt) =>
      alt.map((i) => {
        if (i.key !== key) return i;
        const neu = { ...i, ...aenderung };
        neu.einzelpreis = einzelpreis(
          neu.zeit_stunden,
          neu.stundensatz,
          neu.material_preis,
        );
        neu.gesamtpreis = round2(neu.einzelpreis * neu.menge);
        return neu;
      }),
    );
  }

  async function absenden() {
    setFehler(undefined);
    setSpeichert(true);
    const ergebnis = await onSubmit({
      customer_id: customerId,
      titel,
      gueltig_bis: gueltigBis || null,
      notiz_frei: notizFrei || null,
      mwst_satz: mwstSatz,
      items: items.map((zeile) => ({
        catalog_item_id: zeile.catalog_item_id,
        bezeichnung: zeile.bezeichnung,
        einheit: zeile.einheit,
        menge: zeile.menge,
        zeit_stunden: zeile.zeit_stunden,
        material_preis: zeile.material_preis,
        stundensatz: zeile.stundensatz,
        einzelpreis: zeile.einzelpreis,
        gesamtpreis: zeile.gesamtpreis,
      })),
    });
    setSpeichert(false);
    if (ergebnis.fehler) {
      setFehler(ergebnis.fehler);
      return;
    }
    router.push(`/angebote/${ergebnis.id}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <Feld label="Kunde *">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className={selectKlasse}
        >
          <option value="">Bitte wählen...</option>
          {kunden.map((k) => (
            <option key={k.id} value={k.id}>
              {k.name}
            </option>
          ))}
        </select>
      </Feld>

      <Feld label="Titel *">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          className={eingabeKlasse}
          placeholder="z.B. Carport Neubau"
        />
      </Feld>

      <Feld label="Gültig bis">
        <input
          type="date"
          value={gueltigBis}
          onChange={(e) => setGueltigBis(e.target.value)}
          className={eingabeKlasse}
        />
      </Feld>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Positionen</h2>
        </div>

        {items.length === 0 && (
          <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-zinc-500">
            Noch keine Positionen hinzugefügt.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {items.map((zeile) => (
            <div
              key={zeile.key}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                {zeile.catalog_item_id ? (
                  <p className="font-medium text-zinc-900">{zeile.bezeichnung}</p>
                ) : (
                  <input
                    value={zeile.bezeichnung}
                    onChange={(e) =>
                      zeileAendern(zeile.key, { bezeichnung: e.target.value })
                    }
                    placeholder="Bezeichnung"
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 font-medium focus:border-zinc-900 focus:outline-none"
                  />
                )}
                <button
                  type="button"
                  onClick={() => zeileEntfernen(zeile.key)}
                  aria-label="Position entfernen"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-zinc-400 active:bg-zinc-100"
                >
                  ✕
                </button>
              </div>

              {!zeile.catalog_item_id && (
                <div className="mb-2 grid grid-cols-3 gap-2">
                  <select
                    value={zeile.einheit}
                    onChange={(e) =>
                      zeileAendern(zeile.key, { einheit: e.target.value })
                    }
                    className="col-span-1 h-11 rounded-lg border border-zinc-300 px-2 text-sm"
                  >
                    {["Stück", "m²", "m", "Std."].map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                  <input
                    value={zeile.zeit_stunden}
                    onChange={(e) =>
                      zeileAendern(zeile.key, {
                        zeit_stunden: Number(e.target.value.replace(",", ".")) || 0,
                      })
                    }
                    inputMode="decimal"
                    placeholder="Std./Einheit"
                    className="col-span-1 h-11 rounded-lg border border-zinc-300 px-2 text-sm"
                  />
                  <input
                    value={zeile.material_preis}
                    onChange={(e) =>
                      zeileAendern(zeile.key, {
                        material_preis:
                          Number(e.target.value.replace(",", ".")) || 0,
                      })
                    }
                    inputMode="decimal"
                    placeholder="Material €"
                    className="col-span-1 h-11 rounded-lg border border-zinc-300 px-2 text-sm"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-zinc-500">
                  Menge
                  <input
                    value={zeile.menge}
                    onChange={(e) =>
                      zeileAendern(zeile.key, {
                        menge: Number(e.target.value.replace(",", ".")) || 0,
                      })
                    }
                    inputMode="decimal"
                    className="h-10 w-20 rounded-lg border border-zinc-300 px-2 text-center"
                  />
                  <span>{zeile.einheit}</span>
                </label>
                <p className="text-lg font-bold text-zinc-900">
                  {formatEuro(zeile.gesamtpreis)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {zeigeKatalog && (
          <div className="rounded-xl border border-zinc-200 bg-white p-2">
            {katalog.length === 0 && (
              <p className="p-3 text-sm text-zinc-500">
                Noch keine Katalogpositionen angelegt.
              </p>
            )}
            {katalog.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => katalogPositionHinzufuegen(k)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left active:bg-zinc-100"
              >
                <span className="font-medium text-zinc-900">{k.bezeichnung}</span>
                <span className="text-sm text-zinc-500">
                  {formatEuro(
                    einzelpreis(k.zeit_stunden, k.stundensatz, k.material_preis),
                  )}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setZeigeKatalog((v) => !v)}
            className="h-12 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-900 active:bg-zinc-100"
          >
            + Aus Katalog
          </button>
          <button
            type="button"
            onClick={freiePositionHinzufuegen}
            className="h-12 rounded-xl border border-zinc-300 bg-white font-medium text-zinc-900 active:bg-zinc-100"
          >
            + Freie Position
          </button>
        </div>
      </div>

      <Feld label="Notiz / Sprachnotiz">
        <textarea
          value={notizFrei}
          onChange={(e) => setNotizFrei(e.target.value)}
          rows={4}
          className={textareaKlasse}
          placeholder="Freitext oder per Sprachnotiz einfügen..."
        />
      </Feld>
      <Spracheingabe
        onErgebnis={(text) =>
          setNotizFrei((alt) => (alt ? alt + "\n" + text : text))
        }
      />

      <div className="rounded-xl bg-zinc-100 p-4">
        <div className="flex justify-between text-sm text-zinc-500">
          <span>Netto</span>
          <span>{formatEuro(summenWert.netto)}</span>
        </div>
        <div className="flex justify-between text-sm text-zinc-500">
          <span>MwSt. ({mwstSatz}%)</span>
          <span>{formatEuro(summenWert.mwst)}</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-zinc-300 pt-1 text-lg font-bold text-zinc-900">
          <span>Brutto</span>
          <span>{formatEuro(summenWert.brutto)}</span>
        </div>
      </div>

      <Fehlertext>{fehler}</Fehlertext>
      <PrimaryButton type="button" onClick={absenden} disabled={speichert}>
        {speichert ? "Speichert..." : submitLabel}
      </PrimaryButton>
    </div>
  );
}
