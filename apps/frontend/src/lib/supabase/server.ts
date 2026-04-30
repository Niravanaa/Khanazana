import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerEnv } from '@/lib/env';

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { supabaseAnonKey, supabaseUrl } = getServerEnv();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      console.log(
        '[supabase/server] setAll called with',
        cookiesToSet.map((c) => c.name),
      );
      try {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      } catch (e) {
        console.log('[supabase/server] setAll error:', e);
      }
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: cookieMethods });
}
