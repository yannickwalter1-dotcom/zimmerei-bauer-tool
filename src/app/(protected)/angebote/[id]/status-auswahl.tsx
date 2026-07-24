"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectKlasse } from "@/components/ui";
import type { QuoteStatus } from "@/types/database";
import { angebotStatusAendern } from "../actions";

const optionen: { wert: QuoteStatus; label: string }[] = [
  { wert: "entwurf", label: "Entwurf" },
  { wert: "versendet", label: "Versendet" },
  { wert: "angenommen", label: "Angenommen" },
  { wert: "abgelehnt", label: "Abgelehnt" },
];

export default function StatusAuswahl({
  quoteId,
  status,
}: {
  quoteId: string;
  status: QuoteStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(neu: QuoteStatus) {
    startTransition(async () => {
      await angebotStatusAendern(quoteId, neu);
      router.refresh();
    });
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => handleChange(e.target.value as QuoteStatus)}
      className={`${selectKlasse} h-11 text-base`}
    >
      {optionen.map((o) => (
        <option key={o.wert} value={o.wert}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
