"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface KundenFormState {
  fehler?: string;
}

function ausFormData(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    strasse: String(formData.get("strasse") ?? "").trim() || null,
    plz: String(formData.get("plz") ?? "").trim() || null,
    ort: String(formData.get("ort") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    telefon: String(formData.get("telefon") ?? "").trim() || null,
    notiz: String(formData.get("notiz") ?? "").trim() || null,
  };
}

export async function kundeAnlegen(
  _vorheriger: KundenFormState,
  formData: FormData,
): Promise<KundenFormState> {
  const daten = ausFormData(formData);
  if (!daten.name) {
    return { fehler: "Bitte einen Namen eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("customers").insert(daten);

  if (error) {
    return { fehler: "Kunde konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/kunden");
  redirect("/kunden");
}

export async function kundeAktualisieren(
  id: string,
  _vorheriger: KundenFormState,
  formData: FormData,
): Promise<KundenFormState> {
  const daten = ausFormData(formData);
  if (!daten.name) {
    return { fehler: "Bitte einen Namen eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("customers").update(daten).eq("id", id);

  if (error) {
    return { fehler: "Kunde konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/kunden");
  revalidatePath(`/kunden/${id}`);
  redirect("/kunden");
}

export async function kundeLoeschen(id: string): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);

  if (error) {
    return {
      fehler:
        "Kunde kann nicht gelöscht werden. Vermutlich gibt es noch Angebote oder Rechnungen zu diesem Kunden.",
    };
  }

  revalidatePath("/kunden");
  redirect("/kunden");
}
