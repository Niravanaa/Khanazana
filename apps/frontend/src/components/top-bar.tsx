import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV = [
  { href: '/recipes', label: 'Recipes' },
  { href: '/meal-plan', label: 'Meal Plan' },
  { href: '/shopping-list', label: 'Shopping List' },
] as const;

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Khanazana"
            width={110}
            height={29}
            className="invert dark:invert-0 sm:hidden"
          />
          <Image
            src="/logo.png"
            alt="Khanazana"
            width={130}
            height={34}
            className="hidden invert dark:invert-0 sm:block"
          />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
