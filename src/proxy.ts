import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE_NAME,
  erwarteterCookieWert,
} from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname.startsWith("/api/login")) {
    return NextResponse.next();
  }

  const cookieWert = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const erwartet = await erwarteterCookieWert();

  if (!cookieWert || cookieWert !== erwartet) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("weiter", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)",
  ],
};
