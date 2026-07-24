-- Schema für das Angebots- und Rechnungstool der Zimmerei
-- Einspielen im Supabase SQL Editor oder per `supabase db push`
--
-- Hinweis zu Row Level Security: Diese App verwendet bewusst kein
-- Supabase-Auth-System, sondern einen gemeinsamen Zugangscode auf
-- Next.js-Ebene (siehe middleware.ts). RLS bleibt daher auf allen Tabellen
-- deaktiviert (Postgres-Standard). Der Zugriff wird ausschließlich über die
-- Middleware und dadurch geschützte Server-seitige Datenzugriffe kontrolliert.
-- Der Anon-Key sollte deshalb nicht öffentlich weitergegeben werden.

create extension if not exists "pgcrypto";

-- =========================================================
-- Kunden
-- =========================================================
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  strasse text,
  plz text,
  ort text,
  email text,
  telefon text,
  notiz text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Positionskatalog (wiederkehrende Standardleistungen)
-- =========================================================
create table if not exists catalog_items (
  id uuid primary key default gen_random_uuid(),
  bezeichnung text not null,
  einheit text not null default 'Stück', -- Stück / m² / m / Std.
  zeit_stunden numeric(10, 3) not null default 0, -- Zeitaufwand pro Einheit
  material_preis numeric(10, 2) not null default 0, -- Materialpreis pro Einheit
  stundensatz numeric(10, 2) not null default 0, -- kann globalen Standard überschreiben
  sortierung integer not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Fortlaufende Nummernkreise (Angebote / Rechnungen)
-- =========================================================
create table if not exists number_sequences (
  key text not null check (key in ('angebot', 'rechnung')),
  jahr integer not null,
  letzte_nummer integer not null default 0,
  primary key (key, jahr)
);

-- =========================================================
-- Angebote
-- =========================================================
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  nummer text not null unique, -- Format A-2026-0001
  customer_id uuid not null references customers (id),
  titel text not null,
  status text not null default 'entwurf' check (
    status in ('entwurf', 'versendet', 'angenommen', 'abgelehnt')
  ),
  gueltig_bis date,
  notiz_frei text,
  summe_netto numeric(12, 2) not null default 0,
  mwst_satz numeric(5, 2) not null default 19,
  created_at timestamptz not null default now()
);

create index if not exists quotes_customer_id_idx on quotes (customer_id);

-- =========================================================
-- Angebotspositionen
-- Wichtig: Bezeichnung/Zeit/Preise werden beim Hinzufügen aus dem Katalog
-- kopiert, nicht referenziert. Spätere Katalogänderungen dürfen bestehende
-- Angebote nicht verändern.
-- =========================================================
create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  catalog_item_id uuid references catalog_items (id) on delete set null, -- nullable bei freier Position
  bezeichnung text not null,
  einheit text not null,
  menge numeric(10, 3) not null default 1,
  zeit_stunden numeric(10, 3) not null default 0,
  material_preis numeric(10, 2) not null default 0,
  stundensatz numeric(10, 2) not null default 0,
  einzelpreis numeric(12, 2) not null default 0,
  gesamtpreis numeric(12, 2) not null default 0,
  sortierung integer not null default 0
);

create index if not exists quote_items_quote_id_idx on quote_items (quote_id);

-- =========================================================
-- Rechnungen
-- GoBD: Inhaltlich unveränderbar nach dem Erstellen. Korrekturen nur über
-- Stornorechnung (storniert_von) plus neue Rechnung.
-- =========================================================
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  nummer text not null unique, -- Format R-2026-0001
  quote_id uuid references quotes (id),
  customer_id uuid not null references customers (id),
  rechnungsdatum date not null default current_date,
  leistungsdatum date not null default current_date,
  zahlungsziel_tage integer not null default 14,
  status text not null default 'offen' check (
    status in ('offen', 'bezahlt', 'storniert')
  ),
  storniert_von uuid references invoices (id),
  summe_netto numeric(12, 2) not null default 0,
  mwst_satz numeric(5, 2) not null default 19,
  created_at timestamptz not null default now()
);

create index if not exists invoices_customer_id_idx on invoices (customer_id);
create index if not exists invoices_quote_id_idx on invoices (quote_id);

-- Rechnungspositionen (analog zu quote_items, ebenfalls kopiert statt referenziert)
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices (id) on delete cascade,
  bezeichnung text not null,
  einheit text not null,
  menge numeric(10, 3) not null default 1,
  zeit_stunden numeric(10, 3) not null default 0,
  material_preis numeric(10, 2) not null default 0,
  stundensatz numeric(10, 2) not null default 0,
  einzelpreis numeric(12, 2) not null default 0,
  gesamtpreis numeric(12, 2) not null default 0,
  sortierung integer not null default 0
);

create index if not exists invoice_items_invoice_id_idx on invoice_items (invoice_id);

-- =========================================================
-- Baustellendokumentation
-- =========================================================
create table if not exists site_docs (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes (id) on delete cascade,
  notiz text,
  foto_url text,
  fuer_kunde_freigegeben boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists site_docs_quote_id_idx on site_docs (quote_id);

-- =========================================================
-- Firmendaten (Absenderdaten für PDFs), genau eine Zeile
-- =========================================================
create table if not exists company_settings (
  id boolean primary key default true check (id),
  firmenname text not null default 'Zimmerei Mustermann',
  strasse text not null default 'Musterstraße 1',
  plz text not null default '12345',
  ort text not null default 'Musterstadt',
  telefon text,
  email text,
  steuernummer text,
  ust_id text,
  bank_iban text,
  bank_bic text,
  bank_name text,
  logo_url text,
  standard_stundensatz numeric(10, 2) not null default 45,
  standard_zahlungsziel_tage integer not null default 14,
  standard_gueltigkeit_tage integer not null default 14
);

insert into company_settings (id)
values (true)
on conflict (id) do nothing;

-- =========================================================
-- Fortlaufende, lückenlose Nummernvergabe (atomar)
-- Gibt z.B. "A-2026-0001" bzw. "R-2026-0001" zurück.
-- =========================================================
create or replace function next_beleg_nummer(p_key text, p_jahr int)
returns text
language plpgsql
as $$
declare
  v_naechste integer;
  v_prefix text;
begin
  if p_key = 'angebot' then
    v_prefix := 'A';
  elsif p_key = 'rechnung' then
    v_prefix := 'R';
  else
    raise exception 'Unbekannter Nummernkreis: %', p_key;
  end if;

  insert into number_sequences (key, jahr, letzte_nummer)
  values (p_key, p_jahr, 1)
  on conflict (key, jahr)
  do update set letzte_nummer = number_sequences.letzte_nummer + 1
  returning letzte_nummer into v_naechste;

  return v_prefix || '-' || p_jahr || '-' || lpad(v_naechste::text, 4, '0');
end;
$$;

-- =========================================================
-- Storage Bucket für Baustellenfotos und Firmenlogo
-- Hinweis: Falls dieser Befehl in eurem Supabase-Projekt nicht per SQL
-- erlaubt ist, legt den Bucket "baustellenfotos" stattdessen manuell im
-- Dashboard unter Storage an (siehe README).
-- =========================================================
insert into storage.buckets (id, name, public)
values ('baustellenfotos', 'baustellenfotos', true)
on conflict (id) do nothing;

