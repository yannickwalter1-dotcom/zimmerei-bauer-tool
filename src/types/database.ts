// Handgepflegte Typen passend zu supabase/schema.sql.
// Bei Schemaänderungen bitte hier synchron nachziehen.

export type QuoteStatus = "entwurf" | "versendet" | "angenommen" | "abgelehnt";
export type InvoiceStatus = "offen" | "bezahlt" | "storniert";
export type Einheit = "Stück" | "m²" | "m" | "Std.";

export type Customer = {
  id: string;
  name: string;
  strasse: string | null;
  plz: string | null;
  ort: string | null;
  email: string | null;
  telefon: string | null;
  notiz: string | null;
  created_at: string;
}

export type CatalogItem = {
  id: string;
  bezeichnung: string;
  einheit: string;
  zeit_stunden: number;
  material_preis: number;
  stundensatz: number;
  sortierung: number;
  created_at: string;
}

export type Quote = {
  id: string;
  nummer: string;
  customer_id: string;
  titel: string;
  status: QuoteStatus;
  gueltig_bis: string | null;
  notiz_frei: string | null;
  summe_netto: number;
  mwst_satz: number;
  created_at: string;
}

export type QuoteItem = {
  id: string;
  quote_id: string;
  catalog_item_id: string | null;
  bezeichnung: string;
  einheit: string;
  menge: number;
  zeit_stunden: number;
  material_preis: number;
  stundensatz: number;
  einzelpreis: number;
  gesamtpreis: number;
  sortierung: number;
}

// Eingabeformat für die Positionen beim Anlegen/Aktualisieren eines Angebots
// (an create_quote_with_items / update_quote_with_items übergeben).
export type QuoteItemInput = {
  catalog_item_id: string | null;
  bezeichnung: string;
  einheit: string;
  menge: number;
  zeit_stunden: number;
  material_preis: number;
  stundensatz: number;
  einzelpreis: number;
  gesamtpreis: number;
};

export type Invoice = {
  id: string;
  nummer: string;
  quote_id: string | null;
  customer_id: string;
  rechnungsdatum: string;
  leistungsdatum: string;
  zahlungsziel_tage: number;
  status: InvoiceStatus;
  storniert_von: string | null;
  summe_netto: number;
  mwst_satz: number;
  created_at: string;
}

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  bezeichnung: string;
  einheit: string;
  menge: number;
  zeit_stunden: number;
  material_preis: number;
  stundensatz: number;
  einzelpreis: number;
  gesamtpreis: number;
  sortierung: number;
}

export type SiteDoc = {
  id: string;
  quote_id: string;
  notiz: string | null;
  foto_url: string | null;
  fuer_kunde_freigegeben: boolean;
  created_at: string;
}

export type NumberSequence = {
  key: "angebot" | "rechnung";
  jahr: number;
  letzte_nummer: number;
}

export type CompanySettings = {
  id: boolean;
  firmenname: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string | null;
  email: string | null;
  steuernummer: string | null;
  ust_id: string | null;
  bank_iban: string | null;
  bank_bic: string | null;
  bank_name: string | null;
  logo_url: string | null;
  standard_stundensatz: number;
  standard_zahlungsziel_tage: number;
  standard_gueltigkeit_tage: number;
}

type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

export interface Database {
  public: {
    Views: Record<string, never>;
    Tables: {
      customers: TableDef<Customer>;
      catalog_items: TableDef<CatalogItem>;
      quotes: TableDef<Quote>;
      quote_items: TableDef<QuoteItem>;
      invoices: TableDef<Invoice>;
      invoice_items: TableDef<InvoiceItem>;
      site_docs: TableDef<SiteDoc>;
      number_sequences: TableDef<NumberSequence>;
      company_settings: TableDef<CompanySettings>;
    };
    Functions: {
      next_beleg_nummer: {
        Args: { p_key: "angebot" | "rechnung"; p_jahr: number };
        Returns: string;
      };
      create_quote_with_items: {
        Args: {
          p_customer_id: string;
          p_titel: string;
          p_gueltig_bis: string | null;
          p_notiz_frei: string | null;
          p_mwst_satz: number;
          p_items: QuoteItemInput[];
        };
        Returns: Quote;
      };
      update_quote_with_items: {
        Args: {
          p_quote_id: string;
          p_customer_id: string;
          p_titel: string;
          p_gueltig_bis: string | null;
          p_notiz_frei: string | null;
          p_mwst_satz: number;
          p_items: QuoteItemInput[];
        };
        Returns: Quote;
      };
      create_invoice_from_quote: {
        Args: {
          p_quote_id: string;
          p_rechnungsdatum: string;
          p_leistungsdatum: string;
          p_zahlungsziel_tage: number;
        };
        Returns: Invoice;
      };
      storniere_rechnung: {
        Args: { p_invoice_id: string };
        Returns: Invoice;
      };
    };
  };
}
