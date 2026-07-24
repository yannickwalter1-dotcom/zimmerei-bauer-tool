import type { CompanySettings, Customer, Invoice, InvoiceItem } from "@/types/database";
import { neuesDokument, zeichneFusszeile } from "./shared";
import { zeichneRechnungInhalt } from "./rechnung";

export interface RechnungMitDaten {
  rechnung: Invoice;
  kunde: Customer;
  positionen: InvoiceItem[];
}

// Erzeugt eine PDF-Sammlung aller Rechnungen eines Monats (eine Rechnung pro
// Seite) für den Steuerberater.
export function erzeugeRechnungsSammlungPdf(
  firma: CompanySettings,
  rechnungen: RechnungMitDaten[],
  dateiname: string,
): void {
  const doc = neuesDokument();

  rechnungen.forEach(({ rechnung, kunde, positionen }, i) => {
    if (i > 0) doc.addPage();
    zeichneRechnungInhalt(doc, firma, kunde, rechnung, positionen);
  });

  zeichneFusszeile(doc, firma);
  doc.save(dateiname);
}
