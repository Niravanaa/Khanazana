import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${getAppUrl()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
