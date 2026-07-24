"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Start", icon: "🏠" },
  { href: "/angebote", label: "Angebote", icon: "📄" },
  { href: "/rechnungen", label: "Rechnungen", icon: "🧾" },
  { href: "/kunden", label: "Kunden", icon: "👥" },
  { href: "/mehr", label: "Mehr", icon: "☰" },
];

function istAktiv(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-5">
        {links.map((link) => {
          const aktiv = istAktiv(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  aktiv ? "text-zinc-900" : "text-zinc-400"
                }`}
              >
                <span className="text-xl leading-none">{link.icon}</span>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
