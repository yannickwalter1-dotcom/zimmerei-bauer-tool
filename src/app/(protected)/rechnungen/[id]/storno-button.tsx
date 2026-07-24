"use client";

import { useState, useTransition } from "react";
import { DangerButton } from "@/components/ui";
import { rechnungStornieren } from "../actions";

export default function StornoButton({ invoiceId }: { invoiceId: string }) {
  const [fehler, setFehler] = useState<string>();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (
      !confirm(
        "Rechnung stornieren? Es wird eine Stornorechnung mit negativen Beträgen erstellt. Die Rechnung selbst kann danach nicht mehr geändert werden.",
      )
    )
      return;
    startTransition(async () => {
      const result = await rechnungStornieren(invoiceId);
      if (result?.fehler) setFehler(result.fehler);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {fehler && <p className="text-sm font-medium text-red-600">{fehler}</p>}
      <DangerButton type="button" onClick={handleClick} disabled={pending}>
        {pending ? "Storniert..." : "Rechnung stornieren"}
      </DangerButton>
    </div>
  );
}
