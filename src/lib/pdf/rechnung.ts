import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
} from "@/types/database";
import { datumPlusTage, formatDatum, formatEuro, formatZahl } from "@/lib/format";
import { summen } from "@/lib/calc";
import {
  autoTable,
  finalY,
  neuesDokument,
  SEITENRAND,
  zeichneFusszeile,
  zeichneKopf,
  zeichneKundenAdresse,
  zeichneSummenblock,
} from "./shared";

// Enthält alle Pflichtangaben nach § 14 UStG: vollständiger Name/Anschrift von
// Leistendem und Empfänger, Steuernummer/USt-IdNr., Rechnungsdatum,
// fortlaufende Nummer, Menge/Art der Leistung, Leistungszeitpunkt, nach
// Steuersätzen aufgeschlüsseltes Entgelt sowie Steuersatz und Steuerbetrag.
export function erzeugeRechnungPdf(
  firma: CompanySettings,
  kunde: Customer,
  rechnung: Invoice,
  positionen: InvoiceItem[],
): void {
  const doc = neuesDokument();

  let y = zeichneKopf(doc, firma, "Rechnung", rechnung.nummer);
  y = zeichneKundenAdresse(doc, kunde, y);

  doc.setFontSize(10);
  doc.text(`Rechnungsdatum: ${formatDatum(rechnung.rechnungsdatum)}`, SEITENRAND, y);
  doc.text(
    `Leistungsdatum: ${formatDatum(rechnung.leistungsdatum)}`,
    SEITENRAND,
    y + 5,
  );
  doc.text(
    `Zahlbar bis: ${formatDatum(
      datumPlusTage(rechnung.rechnungsdatum, rechnung.zahlungsziel_tage),
    )} (${rechnung.zahlungsziel_tage} Tage netto)`,
    SEITENRAND,
    y + 10,
  );
  if (firma.steuernummer) {
    doc.text(`Steuernummer: ${firma.steuernummer}`, SEITENRAND, y + 15);
  }
  if (firma.ust_id) {
    doc.text(`USt-IdNr.: ${firma.ust_id}`, SEITENRAND, y + (firma.steuernummer ? 20 : 15));
  }
  y += 26;

  autoTable(doc, {
    startY: y,
    margin: { left: SEITENRAND, right: SEITENRAND },
    head: [["Pos.", "Bezeichnung", "Menge", "Einheit", "Einzelpreis", "Gesamt"]],
    body: positionen.map((p, i) => [
      String(i + 1),
      p.bezeichnung,
      formatZahl(p.menge),
      p.einheit,
      formatEuro(p.einzelpreis),
      formatEuro(p.gesamtpreis),
    ]),
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [39, 39, 42] },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { cellWidth: 20, halign: "right" },
      3: { cellWidth: 20 },
      4: { cellWidth: 28, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
  });

  const { netto, mwst, brutto } = summen(rechnung.summe_netto, rechnung.mwst_satz);
  zeichneSummenblock(doc, finalY(doc) + 10, netto, rechnung.mwst_satz, mwst, brutto);

  zeichneFusszeile(doc, firma);
  doc.save(`${rechnung.nummer}.pdf`);
}
