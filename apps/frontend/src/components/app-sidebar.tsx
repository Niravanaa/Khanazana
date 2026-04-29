'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';

const NAV = [
  { href: '/recipes', label: 'Recipes', icon: '🍳' },
  { href: '/meal-plan', label: 'Meal Plan', icon: '📅' },
  { href: '/shopping-list', label: 'Shopping List', icon: '🛒' },
] as const;

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (e.target instanceof Node && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('click', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <>
      {/* Sidebar for large screens */}
      <aside className="hidden lg:flex sticky top-0 h-screen w-56 shrink-0 flex-col border-r border-border bg-card">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/" className="flex w-full items-center justify-center">
            <Image
              src="/logo.png"
              alt="Khanazana"
              width={120}
              height={32}
              className="invert dark:invert-0"
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {NAV.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom controls */}
        <div className="flex flex-col gap-1 border-t border-border p-2">
          <ThemeToggle showLabel />
          <Link
            href="/auth/logout"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-accent-foreground"
          >
            <span className="text-base">↩</span>
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Top bar for small screens (fixed, removed from layout flow) */}
      <div className="lg:hidden fixed inset-x-0 top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-between px-3 py-2 h-14">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-short.png"
              alt="Khanazana"
              width={28}
              height={28}
              className="invert dark:invert-0"
            />
            <span className="text-sm font-semibold">Khanazana</span>
          </Link>

          <div ref={containerRef} className="relative">
            <button
              aria-label="Open navigation"
              aria-expanded={open}
              onClick={() => setOpen((s) => !s)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border text-foreground"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-md">
                <nav className="flex flex-col p-2">
                  {NAV.map(({ href, label, icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">{icon}</span>
                      <span>{label}</span>
                    </Link>
                  ))}
                  <div className="mt-2 border-t border-border pt-2">
                    <ThemeToggle showLabel />
                    <Link
                      href="/auth/logout"
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">↩</span>
                      <span>Sign Out</span>
                    </Link>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
