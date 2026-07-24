import type { CompanySettings, Customer, Quote, QuoteItem } from "@/types/database";
import { formatDatum, formatEuro, formatZahl } from "@/lib/format";
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

export function erzeugeAngebotPdf(
  firma: CompanySettings,
  kunde: Customer,
  angebot: Quote,
  positionen: QuoteItem[],
): void {
  const doc = neuesDokument();

  let y = zeichneKopf(doc, firma, "Angebot", angebot.nummer);
  y = zeichneKundenAdresse(doc, kunde, y);

  doc.setFontSize(10);
  doc.text(`Datum: ${formatDatum(angebot.created_at)}`, SEITENRAND, y);
  if (angebot.gueltig_bis) {
    doc.text(`Gültig bis: ${formatDatum(angebot.gueltig_bis)}`, SEITENRAND, y + 5);
  }
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(angebot.titel, SEITENRAND, y);
  y += 8;

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

  const { netto, mwst, brutto } = summen(angebot.summe_netto, angebot.mwst_satz);
  let unterY = zeichneSummenblock(
    doc,
    finalY(doc) + 10,
    netto,
    angebot.mwst_satz,
    mwst,
    brutto,
  );

  if (angebot.notiz_frei) {
    unterY += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Notiz", SEITENRAND, unterY);
    unterY += 5;
    doc.setFont("helvetica", "normal");
    const zeilen = doc.splitTextToSize(angebot.notiz_frei, 180);
    doc.text(zeilen, SEITENRAND, unterY);
  }

  zeichneFusszeile(doc, firma);
  doc.save(`${angebot.nummer}.pdf`);
}
