"use client";

import { useState } from "react";
import { SecondaryButton } from "@/components/ui";
import { erzeugeRechnungPdf } from "@/lib/pdf/rechnung";
import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
  SiteDoc,
} from "@/types/database";

export default function PdfButton({
  firma,
  kunde,
  rechnung,
  positionen,
  freigegebeneDokus,
}: {
  firma: CompanySettings;
  kunde: Customer;
  rechnung: Invoice;
  positionen: InvoiceItem[];
  freigegebeneDokus: SiteDoc[];
}) {
  const [erstellt, setErstellt] = useState(false);

  async function klick() {
    setErstellt(true);
    try {
      await erzeugeRechnungPdf(firma, kunde, rechnung, positionen, freigegebeneDokus);
    } finally {
      setErstellt(false);
    }
  }

  return (
    <SecondaryButton type="button" onClick={klick} disabled={erstellt}>
      {erstellt ? "PDF wird erstellt..." : "📄 Als PDF exportieren"}
    </SecondaryButton>
  );
}
