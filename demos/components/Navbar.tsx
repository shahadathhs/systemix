'use client';

import Link from 'next/link';
import { GithubIcon } from '@/components/brand-icons';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/docs', label: 'Docs' },
] as const;

export function Navbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden -ml-2 p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex size-6 items-center justify-center rounded-md bg-zinc-900 text-[13px] font-bold text-white">
            S
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-zinc-950">
            Systemix
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const active =
              href === '/'
                ? pathname === '/'
                : pathname === href || pathname?.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  active
                    ? 'text-zinc-950 font-medium'
                    : 'text-zinc-600 hover:text-zinc-950',
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center">
          <a
            href="https://github.com/shahadathhs/systemix"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-950 transition-colors"
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
