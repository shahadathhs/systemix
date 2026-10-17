'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Tracks whether the user has made an explicit choice; until then the
  // theme follows the OS preference (including live OS switches).
  const [isSystem, setIsSystem] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const current = (root.dataset.theme as 'light' | 'dark') || 'light';
    setTheme(current);
    setIsSystem(!localStorage.getItem('theme'));

    // Follow OS switches while the user hasn't chosen explicitly
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        root.dataset.theme = e.matches ? 'dark' : 'light';
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
      setIsSystem(false);
    } catch {
      /* storage unavailable */
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="btn-icon !w-9 !h-9 !border-line"
      title={
        isSystem
          ? `Theme: system (${theme}) — click to override`
          : `Theme: ${theme} — click to switch`
      }
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
