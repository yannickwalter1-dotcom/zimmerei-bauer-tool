"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDatum } from "@/lib/format";
import type { SiteDoc } from "@/types/database";
import { dokuFreigabeUmschalten, dokuLoeschen } from "./actions";

export default function EintragKarte({
  quoteId,
  eintrag,
}: {
  quoteId: string;
  eintrag: SiteDoc;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function freigabeUmschalten() {
    startTransition(async () => {
      await dokuFreigabeUmschalten(quoteId, eintrag.id, !eintrag.fuer_kunde_freigegeben);
      router.refresh();
    });
  }

  function loeschen() {
    if (!confirm("Diesen Eintrag wirklich löschen?")) return;
    startTransition(async () => {
      await dokuLoeschen(quoteId, eintrag.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      {eintrag.foto_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={eintrag.foto_url}
          alt="Baustellenfoto"
          className="mb-3 h-48 w-full rounded-lg object-cover"
        />
      )}
      {eintrag.notiz && (
        <p className="mb-2 whitespace-pre-wrap text-zinc-900">{eintrag.notiz}</p>
      )}
      <p className="mb-3 text-xs text-zinc-400">{formatDatum(eintrag.created_at)}</p>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={freigabeUmschalten}
          disabled={pending}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            eintrag.fuer_kunde_freigegeben
              ? "bg-green-100 text-green-700"
              : "bg-zinc-100 text-zinc-600"
          }`}
        >
          {eintrag.fuer_kunde_freigegeben ? "✓ Für Kunden freigegeben" : "Nicht freigegeben"}
        </button>
        <button
          type="button"
          onClick={loeschen}
          disabled={pending}
          className="text-sm font-medium text-red-600"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
