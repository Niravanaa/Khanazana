import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getServerEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const { supabaseUrl, supabaseAnonKey } = getServerEnv();

  // Capture any cookies Supabase sets during OAuth initiation (PKCE code verifier)
  const cookieJar = new NextResponse();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) =>
        cookieJar.cookies.set(name, value, options),
      );
    },
  };

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  const response = NextResponse.redirect(data.url);
  // Forward the PKCE code-verifier cookie onto the redirect so the browser stores it
  for (const cookie of cookieJar.headers.getSetCookie()) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}
