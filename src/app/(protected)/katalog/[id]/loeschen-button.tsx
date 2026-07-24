"use client";

import { useState, useTransition } from "react";
import { DangerButton } from "@/components/ui";
import { katalogEintragLoeschen } from "../actions";

export default function LoeschenButton({ id }: { id: string }) {
  const [fehler, setFehler] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("Diese Position wirklich löschen?")) return;
    startTransition(async () => {
      const result = await katalogEintragLoeschen(id);
      if (result?.fehler) setFehler(result.fehler);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {fehler && <p className="text-sm font-medium text-red-600">{fehler}</p>}
      <DangerButton type="button" onClick={handleClick} disabled={pending}>
        {pending ? "Lösche..." : "Position löschen"}
      </DangerButton>
    </div>
  );
}
