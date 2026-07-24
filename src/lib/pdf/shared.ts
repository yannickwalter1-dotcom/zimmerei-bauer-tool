import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanySettings, Customer } from "@/types/database";
import { formatDatum, formatEuro } from "@/lib/format";

export const SEITENRAND = 14;

export function neuesDokument(): jsPDF {
  return new jsPDF({ unit: "mm", format: "a4" });
}

export function finalY(doc: jsPDF): number {
  const mitAutoTable = doc as unknown as { lastAutoTable?: { finalY: number } };
  return mitAutoTable.lastAutoTable?.finalY ?? 40;
}

export { autoTable };

export function zeichneKopf(
  doc: jsPDF,
  firma: CompanySettings,
  belegArt: string,
  belegNummer: string,
): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(firma.firmenname, SEITENRAND, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    [
      firma.strasse,
      `${firma.plz} ${firma.ort}`,
      firma.telefon ?? "",
      firma.email ?? "",
    ].filter(Boolean),
    SEITENRAND,
    26,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(belegArt, 196, 20, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nr. ${belegNummer}`, 196, 27, { align: "right" });

  return 40;
}

export function zeichneKundenAdresse(
  doc: jsPDF,
  kunde: Customer,
  startY: number,
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const zeilen = [
    kunde.name,
    kunde.strasse ?? "",
    [kunde.plz, kunde.ort].filter(Boolean).join(" "),
  ].filter(Boolean);
  doc.text(zeilen, SEITENRAND, startY);
  return startY + zeilen.length * 5 + 6;
}

export function zeichneSummenblock(
  doc: jsPDF,
  startY: number,
  netto: number,
  mwstSatz: number,
  mwst: number,
  brutto: number,
): number {
  const x1 = 130;
  const x2 = 196;
  let y = startY;

  doc.setFontSize(10);
  doc.text("Netto", x1, y);
  doc.text(formatEuro(netto), x2, y, { align: "right" });
  y += 6;
  doc.text(`zzgl. ${formatZahlProzent(mwstSatz)} % MwSt.`, x1, y);
  doc.text(formatEuro(mwst), x2, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Gesamtbetrag", x1, y);
  doc.text(formatEuro(brutto), x2, y, { align: "right" });
  doc.setFont("helvetica", "normal");

  return y + 8;
}

function formatZahlProzent(wert: number): string {
  return new Intl.NumberFormat("de-DE").format(wert);
}

export function zeichneFusszeile(doc: jsPDF, firma: CompanySettings): void {
  const seiten = doc.getNumberOfPages();
  for (let i = 1; i <= seiten; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120);
    const text = [
      firma.firmenname,
      firma.steuernummer ? `Steuernr. ${firma.steuernummer}` : "",
      firma.ust_id ? `USt-IdNr. ${firma.ust_id}` : "",
      firma.bank_iban ? `IBAN ${firma.bank_iban}` : "",
      firma.bank_bic ? `BIC ${firma.bank_bic}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
    doc.text(text, 105, 290, { align: "center" });
    doc.setTextColor(0);
  }
}

export function heutigesDatumFormatiert(): string {
  return formatDatum(new Date());
}
