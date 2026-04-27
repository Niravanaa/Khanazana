import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=missing_code`);
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=auth_callback_failed`);
  }

  return NextResponse.redirect(`${getAppUrl()}/recipes`);
}
