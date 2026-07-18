import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createSupabaseSsrServerClient(cookieStore?: CookieStore) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const resolvedCookieStore = cookieStore ?? (await cookies());

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            resolvedCookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. src/proxy.ts refreshes sessions.
        }
      },
    },
  });
}
