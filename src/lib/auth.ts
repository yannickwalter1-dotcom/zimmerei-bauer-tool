// Zugangscode-Prüfung für die gemeinsame Nutzung (Inhaber + Büro).
// Es gibt kein volles Login-System mit einzelnen Benutzerkonten.

export const ACCESS_COOKIE_NAME = "zimmerei_zugang";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60; // 90 Tage

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Der Cookie-Wert ist der Hash des Zugangscodes, nicht der Code selbst.
export async function erwarteterCookieWert(): Promise<string> {
  const code = process.env.ACCESS_CODE ?? "";
  return sha256Hex(code);
}

export async function istZugangscodeGueltig(eingabe: string): Promise<boolean> {
  const code = process.env.ACCESS_CODE ?? "";
  if (!code) return false;
  return eingabe === code;
}
