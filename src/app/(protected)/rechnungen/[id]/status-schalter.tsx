"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { InvoiceStatus } from "@/types/database";
import { rechnungStatusAendern } from "../actions";

export default function StatusSchalter({
  invoiceId,
  status,
}: {
  invoiceId: string;
  status: InvoiceStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setzen(neu: "offen" | "bezahlt") {
    startTransition(async () => {
      await rechnungStatusAendern(invoiceId, neu);
      router.refresh();
    });
  }

  if (status === "storniert") {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => setzen("offen")}
        className={`h-12 rounded-xl border text-base font-semibold ${
          status === "offen"
            ? "border-zinc-900 bg-zinc-900 text-white"
            : "border-zinc-300 bg-white text-zinc-900"
        }`}
      >
        Offen
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setzen("bezahlt")}
        className={`h-12 rounded-xl border text-base font-semibold ${
          status === "bezahlt"
            ? "border-green-700 bg-green-700 text-white"
            : "border-zinc-300 bg-white text-zinc-900"
        }`}
      >
        Bezahlt
      </button>
    </div>
  );
}
