'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithEmail, signUpWithEmail } from './actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Loading…' : label}
    </Button>
  );
}

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
      {message}
    </div>
  );
}

export function LoginForm({ initialError }: { initialError?: string }) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [signInState, signInAction] = useFormState(signInWithEmail, {
    error: initialError ?? null,
    success: false,
  });
  const [signUpState, signUpAction] = useFormState(signUpWithEmail, {
    error: null,
    success: false,
  });

  useEffect(() => {
    if (signInState.success || signUpState.success) {
      window.location.href = '/recipes';
    }
  }, [signInState.success, signUpState.success]);

  return (
    <div className="space-y-4">
      <div className="flex rounded-lg border border-slate-200 p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab('signin')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'signin'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'signup'
              ? 'bg-white shadow-sm text-slate-900'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign Up
        </button>
      </div>

      {tab === 'signin' && (
        <form action={signInAction} className="space-y-3">
          <ErrorMessage message={signInState.error} />
          <div className="space-y-1">
            <Label htmlFor="signin-email">Email</Label>
            <Input id="signin-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <SubmitButton label="Sign In" />
        </form>
      )}

      {tab === 'signup' && (
        <form action={signUpAction} className="space-y-3">
          <ErrorMessage message={signUpState.error} />
          <div className="space-y-1">
            <Label htmlFor="signup-email">Email</Label>
            <Input id="signup-email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>
          <SubmitButton label="Create Account" />
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-slate-500">or</span>
        </div>
      </div>

      <Link href="/auth/login" className="block">
        <Button variant="outline" className="w-full">
          Continue with Google
        </Button>
      </Link>
    </div>
  );
}
