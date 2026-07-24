import { NextRequest, NextResponse } from "next/server";

// Nimmt eine Audioaufnahme entgegen und lässt sie über die OpenAI Whisper API
// transkribieren. Läuft hinter dem Zugangscode-Schutz (proxy.ts), der Key
// bleibt serverseitig.
export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { fehler: "Spracheingabe ist nicht konfiguriert (OPENAI_API_KEY fehlt)." },
      { status: 500 },
    );
  }

  const formData = await request.formData();
  const audio = formData.get("audio");

  if (!(audio instanceof Blob)) {
    return NextResponse.json(
      { fehler: "Keine Audioaufnahme erhalten." },
      { status: 400 },
    );
  }

  const openaiForm = new FormData();
  openaiForm.append("file", audio, "aufnahme.webm");
  openaiForm.append("model", "whisper-1");
  openaiForm.append("language", "de");

  const antwort = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: openaiForm,
  });

  if (!antwort.ok) {
    return NextResponse.json(
      { fehler: "Transkription ist fehlgeschlagen. Bitte erneut versuchen." },
      { status: 502 },
    );
  }

  const daten = (await antwort.json()) as { text?: string };
  return NextResponse.json({ text: daten.text ?? "" });
}
