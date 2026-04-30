import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { getServerEnv } from '@/lib/env';

export async function POST(request: NextRequest) {
  if (process.env.E2E_TEST_MODE !== 'true') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
  }

  const { supabaseUrl, supabaseAnonKey } = getServerEnv();
  const cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }> =
    [];

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll();
    },
    setAll(incomingCookies) {
      incomingCookies.forEach(({ name, value, options }) => {
        cookiesToSet.push({ name, value, options });
      });
    },
  };

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: cookieMethods,
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });
  response.cookies.set('e2e-auth', '1', {
    path: '/',
    sameSite: 'lax',
    secure: false,
    httpOnly: true,
  });

  return response;
}
