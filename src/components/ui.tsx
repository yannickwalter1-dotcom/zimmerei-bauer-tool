import Link from "next/link";

export function Seite({
  titel,
  zurueck,
  aktion,
  children,
}: {
  titel: string;
  zurueck?: string;
  aktion?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {zurueck && (
            <Link
              href={zurueck}
              className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-zinc-500 active:bg-zinc-100"
              aria-label="Zurück"
            >
              ←
            </Link>
          )}
          <h1 className="text-2xl font-bold text-zinc-900">{titel}</h1>
        </div>
        {aktion}
      </div>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center rounded-xl bg-zinc-900 px-4 text-lg font-semibold text-white transition active:bg-zinc-700 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-lg font-semibold text-zinc-900 transition active:bg-zinc-100 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function DangerButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`flex h-14 w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 text-lg font-semibold text-red-700 transition active:bg-red-100 disabled:opacity-50 ${props.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const cls =
    variant === "primary"
      ? "bg-zinc-900 text-white active:bg-zinc-700"
      : "border border-zinc-300 bg-white text-zinc-900 active:bg-zinc-100";
  return (
    <Link
      href={href}
      className={`flex h-14 w-full items-center justify-center rounded-xl px-4 text-lg font-semibold transition ${cls}`}
    >
      {children}
    </Link>
  );
}

export function Feld({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-zinc-600">{label}</span>
      {children}
    </label>
  );
}

export const eingabeKlasse =
  "h-14 w-full rounded-xl border border-zinc-300 px-4 text-lg focus:border-zinc-900 focus:outline-none";

export const textareaKlasse =
  "w-full rounded-xl border border-zinc-300 px-4 py-3 text-lg focus:border-zinc-900 focus:outline-none";

export const selectKlasse =
  "h-14 w-full rounded-xl border border-zinc-300 bg-white px-4 text-lg focus:border-zinc-900 focus:outline-none";

export function Karte({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  const inner = (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      {children}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="block active:bg-zinc-100">
        {inner}
      </Link>
    );
  }
  return inner;
}

export function Fehlertext({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="text-sm font-medium text-red-600">{children}</p>;
}

export function LeerZustand({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500">
      {text}
    </p>
  );
}

export function Badge({
  children,
  farbe = "zinc",
}: {
  children: React.ReactNode;
  farbe?: "zinc" | "green" | "red" | "amber" | "blue";
}) {
  const farben: Record<string, string> = {
    zinc: "bg-zinc-100 text-zinc-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${farben[farbe]}`}
    >
      {children}
    </span>
  );
}
