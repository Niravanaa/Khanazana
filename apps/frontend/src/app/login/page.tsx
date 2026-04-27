import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from './LoginForm';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const initialError =
    searchParams.error === 'oauth_failed'
      ? 'Google sign in failed. Please try again.'
      : searchParams.error;

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to KhanaKhazana</CardTitle>
          <CardDescription>Create and manage your recipes</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm initialError={initialError} />
        </CardContent>
      </Card>
    </main>
  );
}
