"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  erwarteterCookieWert,
  istZugangscodeGueltig,
} from "@/lib/auth";

export interface LoginState {
  fehler?: string;
}

export async function login(
  _vorheriger: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim();
  const weiter = String(formData.get("weiter") ?? "/");

  if (!(await istZugangscodeGueltig(code))) {
    return { fehler: "Falscher Zugangscode. Bitte erneut versuchen." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, await erwarteterCookieWert(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });

  redirect(weiter && weiter.startsWith("/") ? weiter : "/");
}
