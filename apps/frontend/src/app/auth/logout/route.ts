import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const { supabaseUrl, supabaseAnonKey } = getServerEnv();
  const response = NextResponse.redirect(`${origin}/login`);

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
      );
    },
  };

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });

  await supabase.auth.signOut();
  return response;
}
