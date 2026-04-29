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
    <div className="rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
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
      <div className="flex rounded-lg border border-border p-1 gap-1">
        <button
          type="button"
          onClick={() => setTab('signin')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'signin'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setTab('signup')}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'signup'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
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
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <Link href="/auth/login" className="block">
        <Button variant="outline" className="w-full gap-2">
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </Link>
    </div>
  );
}
