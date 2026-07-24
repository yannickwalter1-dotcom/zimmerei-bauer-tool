import Link from "next/link";
import { abmelden } from "@/app/login/logout-action";

const eintraege = [
  { href: "/katalog", label: "Positionskatalog", icon: "📦" },
  { href: "/export", label: "Steuerberater-Export", icon: "📤" },
  { href: "/einstellungen", label: "Firmendaten & Einstellungen", icon: "⚙️" },
];

export default function MehrPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold text-zinc-900">Mehr</h1>
      <div className="flex flex-col gap-3">
        {eintraege.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-lg font-medium text-zinc-900 shadow-sm active:bg-zinc-100"
          >
            <span className="text-2xl">{e.icon}</span>
            {e.label}
          </Link>
        ))}
        <form action={abmelden}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-4 text-lg font-medium text-red-700 shadow-sm active:bg-zinc-100"
          >
            <span className="text-2xl">🚪</span>
            Abmelden
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="mb-2 text-lg font-semibold text-zinc-900">
          📲 App aufs Handy holen
        </p>
        <p className="mb-3 text-sm text-zinc-500">
          Damit diese Seite wie eine App aussieht und startet, zum
          Home-Bildschirm hinzufügen:
        </p>
        <details className="mb-2">
          <summary className="cursor-pointer font-medium text-zinc-900">
            iPhone (Safari)
          </summary>
          <p className="mt-1 text-sm text-zinc-600">
            Teilen-Symbol antippen → &quot;Zum Home-Bildschirm&quot; auswählen.
          </p>
        </details>
        <details>
          <summary className="cursor-pointer font-medium text-zinc-900">
            Android (Chrome)
          </summary>
          <p className="mt-1 text-sm text-zinc-600">
            Menü (⋮) oben rechts antippen → &quot;App installieren&quot; bzw.
            &quot;Zum Startbildschirm hinzufügen&quot; auswählen.
          </p>
        </details>
      </div>
    </div>
  );
}
