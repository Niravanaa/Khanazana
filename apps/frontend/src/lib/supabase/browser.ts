import { createBrowserClient } from '@supabase/ssr';
import { getPublicEnv } from '@/lib/env';

export function createSupabaseBrowserClient() {
  const { supabaseAnonKey, supabaseUrl } = getPublicEnv();
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
