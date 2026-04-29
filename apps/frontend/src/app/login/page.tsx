import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const initialError =
    searchParams.error === 'oauth_failed'
      ? 'Google sign in failed. Please try again.'
      : searchParams.error;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-4 gap-6">
      <Image
        src="/logo.png"
        alt="Khanazana"
        width={180}
        height={48}
        className="invert dark:invert-0"
        loading="lazy"
      />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to Khanazana</CardTitle>
          <CardDescription>Create and manage your recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm initialError={initialError} />
        </CardContent>
      </Card>
    </main>
  );
}
