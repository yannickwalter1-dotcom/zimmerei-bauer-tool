"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Fehlertext,
  PrimaryButton,
  textareaKlasse,
} from "@/components/ui";
import { dokuEintragErstellen } from "./actions";

export default function UploadForm({ quoteId }: { quoteId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dateiName, setDateiName] = useState<string>();
  const [notiz, setNotiz] = useState("");
  const [freigegeben, setFreigegeben] = useState(false);
  const [speichert, setSpeichert] = useState(false);
  const [fehler, setFehler] = useState<string>();

  async function absenden() {
    setFehler(undefined);
    const datei = fileInputRef.current?.files?.[0];

    if (!datei && !notiz.trim()) {
      setFehler("Bitte ein Foto auswählen oder eine Notiz erfassen.");
      return;
    }

    setSpeichert(true);
    let fotoUrl: string | null = null;

    if (datei) {
      const supabase = createClient();
      const pfad = `${quoteId}/${Date.now()}-${datei.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("baustellenfotos")
        .upload(pfad, datei);

      if (uploadError) {
        setSpeichert(false);
        setFehler("Foto konnte nicht hochgeladen werden: " + uploadError.message);
        return;
      }

      fotoUrl = supabase.storage.from("baustellenfotos").getPublicUrl(pfad)
        .data.publicUrl;
    }

    const ergebnis = await dokuEintragErstellen(
      quoteId,
      notiz.trim() || null,
      fotoUrl,
      freigegeben,
    );
    setSpeichert(false);

    if (ergebnis.fehler) {
      setFehler(ergebnis.fehler);
      return;
    }

    setNotiz("");
    setFreigegeben(false);
    setDateiName(undefined);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setDateiName(e.target.files?.[0]?.name)}
        className="hidden"
        id="foto-input"
      />
      <label
        htmlFor="foto-input"
        className="flex h-14 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white text-lg font-semibold text-zinc-900 active:bg-zinc-100"
      >
        📷 {dateiName ? "Foto ausgewählt" : "Foto aufnehmen / auswählen"}
      </label>
      {dateiName && <p className="text-sm text-zinc-500">{dateiName}</p>}

      <textarea
        value={notiz}
        onChange={(e) => setNotiz(e.target.value)}
        rows={3}
        placeholder="Notiz zur Baustelle..."
        className={textareaKlasse}
      />

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={freigegeben}
          onChange={(e) => setFreigegeben(e.target.checked)}
          className="h-5 w-5"
        />
        Für den Kunden freigeben (erscheint als Anhang zur Rechnung)
      </label>

      <Fehlertext>{fehler}</Fehlertext>
      <PrimaryButton type="button" onClick={absenden} disabled={speichert}>
        {speichert ? "Speichert..." : "Eintrag speichern"}
      </PrimaryButton>
    </div>
  );
}
