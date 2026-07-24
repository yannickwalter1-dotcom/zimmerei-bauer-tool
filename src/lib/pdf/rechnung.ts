import type {
  CompanySettings,
  Customer,
  Invoice,
  InvoiceItem,
  SiteDoc,
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

async function bildAlsDataUrl(url: string): Promise<string | null> {
  try {
    const antwort = await fetch(url);
    if (!antwort.ok) return null;
    const blob = await antwort.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Enthält alle Pflichtangaben nach § 14 UStG: vollständiger Name/Anschrift von
// Leistendem und Empfänger, Steuernummer/USt-IdNr., Rechnungsdatum,
// fortlaufende Nummer, Menge/Art der Leistung, Leistungszeitpunkt, nach
// Steuersätzen aufgeschlüsseltes Entgelt sowie Steuersatz und Steuerbetrag.
// Für den Kunden freigegebene Baustellendoku-Einträge werden als Anhang
// mit ausgegeben.
export async function erzeugeRechnungPdf(
  firma: CompanySettings,
  kunde: Customer,
  rechnung: Invoice,
  positionen: InvoiceItem[],
  freigegebeneDokus: SiteDoc[] = [],
): Promise<void> {
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

  for (const eintrag of freigegebeneDokus) {
    doc.addPage();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Baustellendokumentation", SEITENRAND, 20);
    let bildY = 28;

    if (eintrag.foto_url) {
      const dataUrl = await bildAlsDataUrl(eintrag.foto_url);
      const format = dataUrl?.match(/^data:image\/(\w+);/)?.[1]?.toUpperCase();
      if (dataUrl && format) {
        try {
          doc.addImage(dataUrl, format, SEITENRAND, bildY, 182, 130, undefined, "FAST");
          bildY += 138;
        } catch {
          // Bildformat konnte nicht eingebettet werden, Anhang wird ohne Bild fortgesetzt.
        }
      }
    }

    if (eintrag.notiz) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const zeilen = doc.splitTextToSize(eintrag.notiz, 182);
      doc.text(zeilen, SEITENRAND, bildY);
    }
  }

  zeichneFusszeile(doc, firma);
  doc.save(`${rechnung.nummer}.pdf`);
}
