import Image from 'next/image';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV = [
  { href: '/recipes', label: 'Recipes', icon: '🍳' },
  { href: '/meal-plan', label: 'Meal Plan', icon: '📅' },
  { href: '/shopping-list', label: 'Shopping List', icon: '🛒' },
] as const;

export function AppSidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-border bg-card lg:w-56">
      {/* Brand */}
      <div className="flex h-14 items-center border-b border-border px-3 lg:px-4">
        <Link href="/" className="flex w-full items-center justify-center">
          {/* Icon-only on collapsed sidebar */}
          <Image
            src="/logo-short.png"
            alt="Khanazana"
            width={28}
            height={28}
            className="block shrink-0 invert dark:invert-0 lg:hidden"
          />
          {/* Full wordmark on expanded sidebar */}
          <Image
            src="/logo.png"
            alt="Khanazana"
            width={120}
            height={32}
            className="hidden invert dark:invert-0 lg:block"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {NAV.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:px-3"
          >
            <span className="text-base">{icon}</span>
            <span className="hidden lg:block">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom controls — always pinned to the bottom */}
      <div className="flex flex-col gap-1 border-t border-border p-2">
        <ThemeToggle showLabel />
        <Link
          href="/auth/logout"
          className="flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground lg:px-3"
        >
          <span className="text-base shrink-0">↩</span>
          <span className="hidden lg:block">Sign Out</span>
        </Link>
      </div>
    </aside>
  );
}
