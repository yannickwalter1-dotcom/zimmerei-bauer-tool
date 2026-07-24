"use client";

import { SecondaryButton } from "@/components/ui";
import { erzeugeAngebotPdf } from "@/lib/pdf/angebot";
import type { CompanySettings, Customer, Quote, QuoteItem } from "@/types/database";

export default function PdfButton({
  firma,
  kunde,
  angebot,
  positionen,
}: {
  firma: CompanySettings;
  kunde: Customer;
  angebot: Quote;
  positionen: QuoteItem[];
}) {
  return (
    <SecondaryButton
      type="button"
      onClick={() => erzeugeAngebotPdf(firma, kunde, angebot, positionen)}
    >
      📄 Als PDF exportieren
    </SecondaryButton>
  );
}
