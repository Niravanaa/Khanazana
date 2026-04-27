import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Khanazana</CardTitle>
          <CardDescription>Discover and share recipes with ease</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="flex-1">
              <Button className="w-full">Sign In</Button>
            </Link>
            <Link href="/recipes" className="flex-1">
              <Button variant="outline" className="w-full">
                View Recipes
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
