import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

// Server-seitiger Supabase-Client für Server Components / Server Actions /
// Route Handler. Es gibt kein Supabase-Auth-Session-Handling in dieser App
// (Zugriffsschutz läuft über den Zugangscode in middleware.ts), die
// Cookie-Anbindung wird trotzdem über @supabase/ssr bereitgestellt, damit
// zukünftige Auth-Features ohne Umbau möglich sind.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Wird in Server Components aufgerufen, in denen Cookies nicht
            // gesetzt werden können. Kann ignoriert werden, wenn parallel
            // eine Middleware die Session aktuell hält.
          }
        },
      },
    },
  );
}
