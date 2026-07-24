"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface KatalogFormState {
  fehler?: string;
}

function zahl(formData: FormData, feld: string): number {
  const wert = String(formData.get(feld) ?? "").replace(",", ".").trim();
  const n = Number(wert);
  return Number.isFinite(n) ? n : 0;
}

function ausFormData(formData: FormData) {
  return {
    bezeichnung: String(formData.get("bezeichnung") ?? "").trim(),
    einheit: String(formData.get("einheit") ?? "Stück").trim(),
    zeit_stunden: zahl(formData, "zeit_stunden"),
    material_preis: zahl(formData, "material_preis"),
    stundensatz: zahl(formData, "stundensatz"),
  };
}

export async function katalogEintragAnlegen(
  _vorheriger: KatalogFormState,
  formData: FormData,
): Promise<KatalogFormState> {
  const daten = ausFormData(formData);
  if (!daten.bezeichnung) {
    return { fehler: "Bitte eine Bezeichnung eingeben." };
  }

  const supabase = await createClient();

  const { data: letzte } = await supabase
    .from("catalog_items")
    .select("sortierung")
    .order("sortierung", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("catalog_items").insert({
    ...daten,
    sortierung: (letzte?.sortierung ?? 0) + 1,
  });

  if (error) {
    return { fehler: "Position konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/katalog");
  redirect("/katalog");
}

export async function katalogEintragAktualisieren(
  id: string,
  _vorheriger: KatalogFormState,
  formData: FormData,
): Promise<KatalogFormState> {
  const daten = ausFormData(formData);
  if (!daten.bezeichnung) {
    return { fehler: "Bitte eine Bezeichnung eingeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("catalog_items")
    .update(daten)
    .eq("id", id);

  if (error) {
    return { fehler: "Position konnte nicht gespeichert werden: " + error.message };
  }

  revalidatePath("/katalog");
  redirect("/katalog");
}

export async function katalogEintragLoeschen(
  id: string,
): Promise<{ fehler?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("catalog_items").delete().eq("id", id);

  if (error) {
    return {
      fehler: "Position konnte nicht gelöscht werden: " + error.message,
    };
  }

  revalidatePath("/katalog");
  redirect("/katalog");
}
