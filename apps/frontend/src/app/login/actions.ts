'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';

type AuthState = { error: string | null; success: boolean };

export async function signInWithEmail(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}

export async function signUpWithEmail(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message, success: false };
  return { error: null, success: true };
}
