# Zimmerei Bauer – Angebote, Rechnungen & Baustellendoku

Eine schlanke Web-App für einen kleinen Zimmereibetrieb: Angebote und
Rechnungen in wenigen Klicks erstellen, Baustellendoku direkt vom Handy.
Komplett auf Deutsch, mobile-first, als PWA nutzbar.

**Tech-Stack:** Next.js (App Router) + TypeScript + Tailwind CSS, Supabase
(Postgres + Storage), PDF-Erzeugung clientseitig mit jsPDF, Deployment auf
Vercel.

## Setup

### 1. Supabase-Projekt anlegen

1. Auf [supabase.com](https://supabase.com) ein neues Projekt anlegen.
2. Unter **Project Settings → API** die **Project URL** und den
   **anon public key** notieren.

### 2. Datenbankschema einspielen

1. Im Supabase-Dashboard **SQL Editor** öffnen.
2. Den Inhalt von [`supabase/schema.sql`](./supabase/schema.sql) einfügen und
   ausführen.

Das Schema legt alle Tabellen an (Kunden, Positionskatalog, Angebote,
Rechnungen, Baustellendoku, Nummernkreise, Firmeneinstellungen), die
Postgres-Funktionen für die atomare, lückenlose Nummernvergabe sowie den
Storage-Bucket `baustellenfotos` samt Zugriffsrichtlinien.

> Falls das Anlegen des Storage-Buckets per SQL in eurem Projekt nicht
> erlaubt ist: Im Dashboard unter **Storage** einen neuen Bucket namens
> `baustellenfotos` anlegen und als **Public** markieren. Die Policies aus
> `schema.sql` (Abschnitt "Storage Bucket") danach trotzdem ausführen.

### 3. Umgebungsvariablen setzen

`.env.local.example` nach `.env.local` kopieren und ausfüllen:

```bash
cp .env.local.example .env.local
```

| Variable | Beschreibung |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL aus Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon Public Key aus Supabase |
| `ACCESS_CODE` | Gemeinsamer Zugangscode für Inhaber + Büro (frei wählbar) |
| `OPENAI_API_KEY` | API-Key für die Spracheingabe-Transkription (Whisper) |

**Hinweis zur Zugriffssicherung:** Diese App verwendet bewusst kein
vollständiges Login-System, sondern einen gemeinsamen Zugangscode (siehe
`src/proxy.ts`). Row Level Security bleibt in Supabase deshalb deaktiviert;
der Anon-Key sollte daher nicht öffentlich geteilt werden.

### 4. Lokal starten

```bash
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:3000`. Beim ersten Aufruf wird
nach dem Zugangscode gefragt.

### 5. Auf Vercel deployen

1. Repository mit einem Vercel-Projekt verbinden.
2. Die vier Umgebungsvariablen aus Schritt 3 in den Vercel-Projekteinstellungen
   (**Settings → Environment Variables**) hinterlegen.
3. Deployen. Vercel erkennt Next.js automatisch.

### 6. Firmendaten pflegen

Nach dem ersten Login unter **Mehr → Firmendaten & Einstellungen** die
echten Firmendaten (Anschrift, Steuernummer/USt-IdNr., Bankverbindung, Logo)
hinterlegen – diese werden in allen PDFs (Angebote, Rechnungen,
Steuerberater-Export) verwendet. Bis dahin werden Platzhalterdaten
angezeigt.

### 7. Als App auf dem Handy nutzen

Unter **Mehr → 📲 App aufs Handy holen** stehen kurze Anleitungen für iPhone
(Safari: Teilen → Zum Home-Bildschirm) und Android (Chrome: Menü → App
installieren).

## Funktionsübersicht

- **Kunden** – Liste, Anlegen, Bearbeiten, Löschen
- **Positionskatalog** – Wiederkehrende Standardleistungen mit
  automatischer Einzelpreisberechnung (Zeit × Stundensatz + Material)
- **Angebote** – Positionen per Klick aus dem Katalog oder frei erfassen,
  Sprachnotiz per Mikrofon (Transkription über OpenAI Whisper), Live-Summen,
  PDF-Export
- **Rechnungen** – Per Klick aus einem Angebot erzeugen, fortlaufende
  Nummer, Pflichtangaben nach § 14 UStG im PDF, GoBD-konform (keine
  nachträgliche Änderung, Korrektur nur per Stornorechnung)
- **Baustellendokumentation** – Fotos und Notizen pro Auftrag, optionale
  Freigabe für den Kunden, freigegebene Einträge erscheinen als Anhang der
  Rechnung
- **Steuerberater-Export** – Alle Rechnungen eines Monats als PDF-Sammlung
  oder CSV-Liste herunterladen

## Projektstruktur

```
src/
  app/
    login/                 Zugangscode-Login
    (protected)/           Alle geschützten Seiten (Kunden, Angebote, ...)
    api/transkription/     Route für die Whisper-Transkription
  components/               Wiederverwendbare UI-Bausteine
  lib/                       Formatierung, Preisberechnung, PDF-Erzeugung,
                             Supabase-Clients
  types/database.ts          Handgepflegte Typen passend zu supabase/schema.sql
supabase/schema.sql          Datenbankschema, Funktionen, Storage-Policies
```
