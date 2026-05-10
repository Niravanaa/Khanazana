'use client';

import { useEffect, useRef, useState } from 'react';

const THEMES = [
  { id: 'sage', label: 'Sage', color: 'hsl(142 55% 38%)' },
  { id: 'rose', label: 'Rose', color: 'hsl(345 55% 52%)' },
  { id: 'lavender', label: 'Lavender', color: 'hsl(270 50% 55%)' },
  { id: 'peach', label: 'Peach', color: 'hsl(20 65% 58%)' },
  { id: 'sky', label: 'Sky', color: 'hsl(205 60% 52%)' },
  { id: 'teal', label: 'Teal', color: 'hsl(175 55% 38%)' },
  { id: 'amber', label: 'Amber', color: 'hsl(42 70% 50%)' },
  { id: 'sand', label: 'Sand', color: 'hsl(35 30% 52%)' },
] as const;

type ThemeId = (typeof THEMES)[number]['id'];

function applyColorTheme(id: ThemeId) {
  const el = document.documentElement;
  THEMES.forEach((t) => {
    if (t.id !== 'sage') el.classList.remove(`theme-${t.id}`);
  });
  if (id !== 'sage') el.classList.add(`theme-${id}`);
  localStorage.setItem('color-theme', id);
}

export function ThemePicker() {
  const [colorTheme, setColorTheme] = useState<ThemeId>('sage');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = (localStorage.getItem('color-theme') ?? 'sage') as ThemeId;
    setColorTheme(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function handleSelect(id: ThemeId) {
    applyColorTheme(id);
    setColorTheme(id);
    setOpen(false);
  }

  return (
    <div ref={containerRef}>
      <button
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-label="Pick color theme"
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="shrink-0"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
        </svg>
        <span>Color theme</span>
      </button>

      {open && (
        <div className="mx-1 mb-1 rounded-md border border-border bg-card p-2">
          <div className="grid grid-cols-2 gap-1">
            {THEMES.map(({ id, label, color }) => (
              <button
                key={id}
                onClick={() => handleSelect(id)}
                aria-pressed={colorTheme === id}
                className={[
                  'flex flex-col items-center gap-1.5 rounded-md p-2 transition-colors hover:bg-accent',
                  colorTheme === id ? 'bg-accent' : '',
                ].join(' ')}
              >
                <span
                  style={{ backgroundColor: color }}
                  className={[
                    'h-7 w-7 rounded-full',
                    colorTheme === id
                      ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card'
                      : '',
                  ].join(' ')}
                />
                <span className="text-xs text-foreground">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
