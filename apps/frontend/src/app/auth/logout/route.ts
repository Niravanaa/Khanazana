import { NextResponse } from 'next/server';
import { getAppUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(`${getAppUrl()}/login`);
}
