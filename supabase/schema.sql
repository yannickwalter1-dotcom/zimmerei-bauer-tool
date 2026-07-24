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
-- Angebot inkl. Positionen atomar anlegen
-- p_items ist ein JSON-Array mit den Feldern aus quote_items (als Text/Zahl).
-- =========================================================
create or replace function create_quote_with_items(
  p_customer_id uuid,
  p_titel text,
  p_gueltig_bis date,
  p_notiz_frei text,
  p_mwst_satz numeric,
  p_items jsonb
) returns quotes
language plpgsql
as $$
declare
  v_quote quotes;
  v_nummer text;
  v_summe numeric(12, 2);
begin
  v_nummer := next_beleg_nummer('angebot', extract(year from now())::int);

  select coalesce(sum((item ->> 'gesamtpreis')::numeric), 0)
  into v_summe
  from jsonb_array_elements(p_items) as item;

  insert into quotes (
    nummer, customer_id, titel, gueltig_bis, notiz_frei, summe_netto, mwst_satz
  )
  values (
    v_nummer, p_customer_id, p_titel, p_gueltig_bis, p_notiz_frei, v_summe, p_mwst_satz
  )
  returning * into v_quote;

  insert into quote_items (
    quote_id, catalog_item_id, bezeichnung, einheit, menge, zeit_stunden,
    material_preis, stundensatz, einzelpreis, gesamtpreis, sortierung
  )
  select
    v_quote.id,
    nullif(item ->> 'catalog_item_id', '')::uuid,
    item ->> 'bezeichnung',
    item ->> 'einheit',
    (item ->> 'menge')::numeric,
    (item ->> 'zeit_stunden')::numeric,
    (item ->> 'material_preis')::numeric,
    (item ->> 'stundensatz')::numeric,
    (item ->> 'einzelpreis')::numeric,
    (item ->> 'gesamtpreis')::numeric,
    ordinality::int
  from jsonb_array_elements(p_items) with ordinality as t (item, ordinality);

  return v_quote;
end;
$$;

-- =========================================================
-- Angebot inkl. Positionen aktualisieren (nur im Status "entwurf" sinnvoll,
-- wird von der UI durchgesetzt). Ersetzt alle Positionen.
-- =========================================================
create or replace function update_quote_with_items(
  p_quote_id uuid,
  p_customer_id uuid,
  p_titel text,
  p_gueltig_bis date,
  p_notiz_frei text,
  p_mwst_satz numeric,
  p_items jsonb
) returns quotes
language plpgsql
as $$
declare
  v_quote quotes;
  v_summe numeric(12, 2);
begin
  select coalesce(sum((item ->> 'gesamtpreis')::numeric), 0)
  into v_summe
  from jsonb_array_elements(p_items) as item;

  update quotes
  set customer_id = p_customer_id,
      titel = p_titel,
      gueltig_bis = p_gueltig_bis,
      notiz_frei = p_notiz_frei,
      summe_netto = v_summe,
      mwst_satz = p_mwst_satz
  where id = p_quote_id
  returning * into v_quote;

  delete from quote_items where quote_id = p_quote_id;

  insert into quote_items (
    quote_id, catalog_item_id, bezeichnung, einheit, menge, zeit_stunden,
    material_preis, stundensatz, einzelpreis, gesamtpreis, sortierung
  )
  select
    p_quote_id,
    nullif(item ->> 'catalog_item_id', '')::uuid,
    item ->> 'bezeichnung',
    item ->> 'einheit',
    (item ->> 'menge')::numeric,
    (item ->> 'zeit_stunden')::numeric,
    (item ->> 'material_preis')::numeric,
    (item ->> 'stundensatz')::numeric,
    (item ->> 'einzelpreis')::numeric,
    (item ->> 'gesamtpreis')::numeric,
    ordinality::int
  from jsonb_array_elements(p_items) with ordinality as t (item, ordinality);

  return v_quote;
end;
$$;

-- =========================================================
-- Rechnung aus einem Angebot atomar erzeugen (übernimmt Positionen 1:1).
-- =========================================================
create or replace function create_invoice_from_quote(
  p_quote_id uuid,
  p_rechnungsdatum date,
  p_leistungsdatum date,
  p_zahlungsziel_tage int
) returns invoices
language plpgsql
as $$
declare
  v_invoice invoices;
  v_nummer text;
  v_quote quotes;
begin
  select * into v_quote from quotes where id = p_quote_id;

  if v_quote.id is null then
    raise exception 'Angebot nicht gefunden';
  end if;

  v_nummer := next_beleg_nummer('rechnung', extract(year from now())::int);

  insert into invoices (
    nummer, quote_id, customer_id, rechnungsdatum, leistungsdatum,
    zahlungsziel_tage, summe_netto, mwst_satz
  )
  values (
    v_nummer, v_quote.id, v_quote.customer_id, p_rechnungsdatum, p_leistungsdatum,
    p_zahlungsziel_tage, v_quote.summe_netto, v_quote.mwst_satz
  )
  returning * into v_invoice;

  insert into invoice_items (
    invoice_id, bezeichnung, einheit, menge, zeit_stunden,
    material_preis, stundensatz, einzelpreis, gesamtpreis, sortierung
  )
  select
    v_invoice.id, bezeichnung, einheit, menge, zeit_stunden,
    material_preis, stundensatz, einzelpreis, gesamtpreis, sortierung
  from quote_items
  where quote_id = v_quote.id;

  return v_invoice;
end;
$$;

-- =========================================================
-- Stornorechnung erzeugen (GoBD: Korrektur nur per Storno + neuer Rechnung).
-- Erzeugt eine neue Rechnung mit negativen Beträgen, verknüpft über
-- storniert_von, und setzt die ursprüngliche Rechnung auf "storniert".
-- =========================================================
create or replace function storniere_rechnung(p_invoice_id uuid) returns invoices
language plpgsql
as $$
declare
  v_original invoices;
  v_storno invoices;
  v_nummer text;
begin
  select * into v_original from invoices where id = p_invoice_id;

  if v_original.id is null then
    raise exception 'Rechnung nicht gefunden';
  end if;

  if v_original.status = 'storniert' then
    raise exception 'Rechnung ist bereits storniert';
  end if;

  v_nummer := next_beleg_nummer('rechnung', extract(year from now())::int);

  -- Die Stornorechnung selbst ist ein eigenständiger, gültiger Beleg mit
  -- negativen Beträgen (kein storniert_von, da sie nicht selbst storniert ist).
  insert into invoices (
    nummer, quote_id, customer_id, rechnungsdatum, leistungsdatum,
    zahlungsziel_tage, status, summe_netto, mwst_satz
  )
  values (
    v_nummer, v_original.quote_id, v_original.customer_id, current_date,
    v_original.leistungsdatum, v_original.zahlungsziel_tage, 'offen',
    -v_original.summe_netto, v_original.mwst_satz
  )
  returning * into v_storno;

  insert into invoice_items (
    invoice_id, bezeichnung, einheit, menge, zeit_stunden,
    material_preis, stundensatz, einzelpreis, gesamtpreis, sortierung
  )
  select
    v_storno.id,
    'Storno: ' || bezeichnung,
    einheit, menge, zeit_stunden, material_preis, stundensatz,
    -einzelpreis, -gesamtpreis, sortierung
  from invoice_items
  where invoice_id = v_original.id;

  -- Die ursprüngliche Rechnung wird als storniert markiert und verweist auf
  -- die Stornorechnung, die sie storniert hat.
  update invoices
  set status = 'storniert', storniert_von = v_storno.id
  where id = v_original.id;

  return v_storno;
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

