"use client";

import { useRef, useState } from "react";

type Status = "bereit" | "nimmt_auf" | "transkribiert" | "fehler";

export default function Spracheingabe({
  onErgebnis,
}: {
  onErgebnis: (text: string) => void;
}) {
  const [status, setStatus] = useState<Status>("bereit");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function aufnahmeStarten() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setStatus("transkribiert");

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", blob, "aufnahme.webm");

        try {
          const res = await fetch("/api/transkription", {
            method: "POST",
            body: formData,
          });
          const daten = await res.json();
          if (!res.ok) throw new Error(daten.fehler ?? "Fehler");
          onErgebnis(daten.text ?? "");
          setStatus("bereit");
        } catch {
          setStatus("fehler");
        }
      };

      recorderRef.current = recorder;
      recorder.start();
      setStatus("nimmt_auf");
    } catch {
      setStatus("fehler");
    }
  }

  function aufnahmeStoppen() {
    recorderRef.current?.stop();
  }

  return (
    <div className="flex items-center gap-3">
      {status !== "nimmt_auf" ? (
        <button
          type="button"
          onClick={aufnahmeStarten}
          disabled={status === "transkribiert"}
          className="flex h-12 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 font-medium text-zinc-900 active:bg-zinc-100 disabled:opacity-50"
        >
          🎙️ Sprachnotiz aufnehmen
        </button>
      ) : (
        <button
          type="button"
          onClick={aufnahmeStoppen}
          className="flex h-12 items-center gap-2 rounded-xl bg-red-600 px-4 font-medium text-white"
        >
          ⏹️ Aufnahme stoppen
        </button>
      )}
      {status === "transkribiert" && (
        <span className="text-sm text-zinc-500">Wird transkribiert...</span>
      )}
      {status === "fehler" && (
        <span className="text-sm text-red-600">
          Aufnahme fehlgeschlagen. Bitte erneut versuchen.
        </span>
      )}
    </div>
  );
}
