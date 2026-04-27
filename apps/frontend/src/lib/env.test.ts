import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppUrl, getPublicEnv } from './env';

describe('getPublicEnv', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns both env vars when set', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54331');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    expect(getPublicEnv()).toEqual({
      supabaseUrl: 'http://localhost:54331',
      supabaseAnonKey: 'test-anon-key',
    });
  });

  it('throws when NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');

    expect(() => getPublicEnv()).toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  });

  it('throws when NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'http://localhost:54331');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', '');

    expect(() => getPublicEnv()).toThrow(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    );
  });
});

describe('getAppUrl', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('returns NEXT_PUBLIC_APP_URL when set', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://myapp.vercel.app');

    expect(getAppUrl()).toBe('https://myapp.vercel.app');
  });

  it('falls back to localhost:3000 when env var is not set', () => {
    delete (process.env as Record<string, string | undefined>).NEXT_PUBLIC_APP_URL;

    expect(getAppUrl()).toBe('http://localhost:3000');
  });
});
