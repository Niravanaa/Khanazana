import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TopBar } from '@/components/top-bar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main
        className="flex items-center justify-center p-4"
        style={{ minHeight: 'calc(100vh - 3.5rem)' }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="items-center">
            <Image
              src="/logo.png"
              alt="Khanazana"
              width={200}
              height={54}
              className="mb-2 invert dark:invert-0"
              loading="lazy"
            />
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
    </div>
  );
}
