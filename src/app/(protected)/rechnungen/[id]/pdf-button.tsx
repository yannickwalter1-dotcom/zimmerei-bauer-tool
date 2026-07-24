"use client";

import { SecondaryButton } from "@/components/ui";
import { erzeugeRechnungPdf } from "@/lib/pdf/rechnung";
import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
} from "@/types/database";

export default function PdfButton({
  firma,
  kunde,
  rechnung,
  positionen,
}: {
  firma: CompanySettings;
  kunde: Customer;
  rechnung: Invoice;
  positionen: InvoiceItem[];
}) {
  return (
    <SecondaryButton
      type="button"
      onClick={() => erzeugeRechnungPdf(firma, kunde, rechnung, positionen)}
    >
      📄 Als PDF exportieren
    </SecondaryButton>
  );
}
