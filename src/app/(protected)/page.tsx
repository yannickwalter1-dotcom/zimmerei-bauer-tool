import Link from "next/link";

const kacheln = [
  { href: "/angebote/neu", label: "Neues Angebot", icon: "📄" },
  { href: "/kunden/neu", label: "Neuer Kunde", icon: "👤" },
  { href: "/angebote", label: "Alle Angebote", icon: "📋" },
  { href: "/rechnungen", label: "Alle Rechnungen", icon: "🧾" },
];

export default function StartPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Zimmerei Bauer</h1>
        <p className="text-zinc-500">Was möchten Sie tun?</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {kacheln.map((k) => (
          <Link
            key={k.href}
            href={k.href}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm active:bg-zinc-100"
          >
            <span className="text-3xl">{k.icon}</span>
            <span className="text-base font-semibold text-zinc-900">
              {k.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
